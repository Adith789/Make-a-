const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./auth/auth.routes'));
app.use('/api/catalog', require('./catalog/catalog.routes'));
app.use('/api/subscriptions', require('./subscriptions/subscriptions.routes'));
app.use('/api/billing', require('./billing/billing.routes'));
app.use('/api/discounts', require('./discounts/discounts.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`🚀 BrightLoop ERP server running on http://localhost:${PORT}`));
