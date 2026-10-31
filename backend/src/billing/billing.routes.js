```javascript
/**
 * Brightloop Software — Subscription Management System
 * Module 4 Routes: Billing Day, Invoices, Payments & Finance Lead Analytics
 * Owner: Abhijith B S (Hour 1 Deliverable)
 * Mount path in backend/src/server.js: app.use('/api/billing', billingRoutes)
 */

const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');

// Scene 4: Billing Day Automated Batch Invoice Generator (Idempotent)
router.post('/run-billing-day', billingController.runBillingDay);

// Scene 4: Invoice Listing, Single Printable View & Status Transitions (Draft -> Confirmed -> Paid)
router.get('/invoices', billingController.getInvoices);
router.get('/invoices/:id', billingController.getInvoiceById);
router.patch('/invoices/:id/status', billingController.updateInvoiceStatus);

// Scene 6: Record & List Incoming Customer Payments (Method, Amount, Date, Note)
router.get('/payments', billingController.getPayments);
router.post('/payments', billingController.recordPayment);

// Scene 7: Finance Lead End-of-Month Summary (<2s SLA) & 2,500-Record Benchmark Seeder
router.get('/finance-summary', billingController.getFinanceSummary);
router.post('/seed-benchmark', billingController.seedBenchmarkData);

module.exports = router;
```
