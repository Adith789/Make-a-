const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// GET /api/catalog - Public listing of products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const where = { active: true };
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/catalog/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/catalog - Admin only
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, price, category, sku, stock } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price), category, sku, stock: Number(stock) }
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/catalog/:id - Admin only
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, price, category, sku, stock, active } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, price: parseFloat(price), category, sku, stock: Number(stock), active }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/catalog/:id - Admin only (soft delete)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
