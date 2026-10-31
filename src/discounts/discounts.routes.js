const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// GET /api/discounts - Admin: list all discounts
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discounts - Admin: create discount
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { code, type, value, maxUses, expiresAt, description } = req.body;
    const existing = await prisma.discount.findUnique({ where: { code } });
    if (existing) return res.status(409).json({ error: 'Discount code already exists' });

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        type, // 'percent' | 'fixed'
        value: parseFloat(value),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description
      }
    });
    res.status(201).json(discount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discounts/validate - Public: validate a discount code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const discount = await prisma.discount.findFirst({
      where: {
        code: code.toUpperCase(),
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]
      }
    });

    if (!discount) return res.status(404).json({ error: 'Invalid or expired discount code' });

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return res.status(400).json({ error: 'Discount code usage limit reached' });
    }

    res.json({ valid: true, discount: { code: discount.code, type: discount.type, value: discount.value, description: discount.description } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/discounts/:id - Admin: toggle active state
router.patch('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { active } = req.body;
    const discount = await prisma.discount.update({
      where: { id: req.params.id },
      data: { active }
    });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/discounts/:id - Admin: delete discount
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await prisma.discount.delete({ where: { id: req.params.id } });
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
