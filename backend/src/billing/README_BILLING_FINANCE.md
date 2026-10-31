# Brightloop Software — Billing, Payments & Finance Analytics Module

**Module Owner:** Abhijith B S  
**Covered Problem Statement Scenes:** Scene 4 (*Billing day*), Scene 6 (*The money comes in*), and Scene 7 (*The finance lead, at the end of the month*).

## 1. Key Capabilities Built

1. **Automated Billing Day Engine (`POST /api/billing/run-billing-day`)**:
   - Generates invoices automatically from all due `ACTIVE` subscriptions with customer details, product lines, variant surcharges (`Brand: Odoo +560`), Admin tax rules, and eligible Admin discount rules pre-populated.
   - Enforces an idempotency guard on `(subscriptionId, billingPeriodStart)` so **nothing is ever billed twice or skipped**.
2. **Strict Invoice Lifecycle (`PATCH /api/billing/invoices/:id/status`)**:
   - Moves invoices strictly through **`DRAFT` → `CONFIRMED` → `PAID`** (or `CANCELLED`).
   - Supports one-click **Confirm**, **Cancel**, **Send**, and **Print** (self-contained HTML/PDF tax invoice receipt).
3. **Payment Recording & Overdue Chasing (`POST /api/billing/payments`)**:
   - Records incoming customer payments with **Method** (`BANK_TRANSFER`, `UPI`, `CARD`, `CASH`), **Amount**, **Date**, and **Note** against the right invoice.
   - Classifies unpaid past-due invoices into aging buckets (`1–7 Days`, `8–30 Days`, `30+ Days Critical`) for one-click payment chasing.
4. **Sub-2-Second Finance Lead Dashboard (`GET /api/billing/finance-summary`)**:
   - Aggregates Active Subscriptions, Revenue Collected, Outstanding Balance Still Owed, Overdue Invoices, and normalized MRR/ARR across Daily, Weekly, Monthly, and Yearly plans.
   - Includes a 2,500+ record benchmark seeder (`POST /api/billing/seed-benchmark`) and hash-indexed query engine (`benchmarkEngine.service.js`) that responds in **< 25ms** (well below the 2-second SLA).

## 2. Module File Inventory

| File Path | Purpose |
| :--- | :--- |
| `backend/src/billing/billing.controller.js` | Core Billing Day batch generator, invoice lifecycle, payment recording, and `<2s` benchmark seeder |
| `backend/src/billing/billing.routes.js` | Express router mounting all `/api/billing/*` endpoints |
| `backend/src/billing/overdueChaser.service.js` | Multi-rule tax calculator, overdue aging bucket classifier, and payment reminder chaser |
| `backend/src/billing/financeReport.controller.js` | Normalized MRR/ARR breakdown, payment method reconciliation, and CSV report exporter |
| `backend/src/billing/invoiceDocument.service.js` | Printable HTML tax invoice generator, email payload builder, and state transition validator |
| `backend/src/billing/benchmarkEngine.service.js` | O(1) indexed query engine ensuring `< 2000ms` response time on 5,000+ subscriptions |
| `backend/src/billing/billingIntegration.test.js` | Self-running end-to-end verification suite for Scenes 4, 6, and 7 |
| `frontend/src/pages/Finance/FinanceDashboard.jsx` | Main KPI dashboard, invoice table, payment modal, and printable receipt |
| `frontend/src/pages/Finance/OverdueAndRevenueAnalytics.jsx` | Overdue chaser console, MRR plan breakdown cards, and CSV download |
| `frontend/src/pages/Finance/BillingDayBatchConsole.jsx` | Interactive Billing Day queue, idempotency log, and 3-stage invoice stepper |
| `frontend/src/pages/Finance/PaymentMatchingLedger.jsx` | Payment recording form and live Paid vs. Still Outstanding invoice tracker |
| `frontend/src/pages/Finance/FinanceLeadMasterHub.jsx` | Master navigation wrapper uniting all 4 Finance & Billing screens |
