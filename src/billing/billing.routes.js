const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// GET /api/billing/invoices - User's invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/billing/invoices/all - Admin: all invoices
router.get('/invoices/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/invoices - Create invoice
router.post('/invoices', authenticateToken, async (req, res) => {
  try {
    const { items, notes } = req.body;
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        subtotal,
        tax,
        total,
        status: 'pending',
        notes,
        items: { create: items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.quantity * i.unitPrice })) }
      },
      include: { items: true }
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/billing/invoices/:id/pay - Mark as paid
router.patch('/invoices/:id/pay', authenticateToken, async (req, res) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'paid', paidAt: new Date() }
    });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/billing/stats - Admin dashboard stats
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const [totalRevenue, pendingInvoices, activeSubscriptions, totalUsers] = await Promise.all([
      prisma.invoice.aggregate({ where: { status: 'paid' }, _sum: { total: true } }),
      prisma.invoice.count({ where: { status: 'pending' } }),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.user.count()
    ]);
    res.json({
      totalRevenue: totalRevenue._sum.total || 0,
      pendingInvoices,
      activeSubscriptions,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
