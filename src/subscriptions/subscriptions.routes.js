const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// GET /api/subscriptions - User's own subscriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subscriptions/all - Admin: all subscriptions
router.get('/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: { plan: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions - Subscribe to a plan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { planId, discountCode } = req.body;
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    let finalPrice = plan.price;
    let discountId = null;

    if (discountCode) {
      const discount = await prisma.discount.findFirst({
        where: { code: discountCode, active: true, expiresAt: { gte: new Date() } }
      });
      if (discount) {
        finalPrice = discount.type === 'percent'
          ? finalPrice * (1 - discount.value / 100)
          : Math.max(0, finalPrice - discount.value);
        discountId = discount.id;
      }
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + (plan.intervalDays || 30));

    const subscription = await prisma.subscription.create({
      data: { userId: req.user.id, planId, status: 'active', price: finalPrice, discountId, endsAt },
      include: { plan: true }
    });
    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/subscriptions/:id/cancel
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const updated = await prisma.subscription.update({
      where: { id: req.params.id },
      data: { status: 'cancelled', cancelledAt: new Date() }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
