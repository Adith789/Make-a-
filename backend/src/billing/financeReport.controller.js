/**
 * Brightloop Software — Subscription Management System
 * Hour 2 Controller: Finance Lead End-of-Month MRR Reports, Reconciliation & CSV Export
 * Owner: Abhijith B S
 *
 * Implements:
 *  - Scene 6: Bank statement & payment method reconciliation against invoices.
 *  - Scene 7: MRR/ARR recurring revenue normalization across Daily, Weekly, Monthly,
 *    and Yearly plans,overdue aging summary, and instant <2s CSV export.
 */

const {
  scanOverdueReceivables,
  chaseOverdueInvoice,
} = require('./overdueChaser.service');

/**
 * Normalizes any plan's recurring billing amount into Monthly Recurring Revenue (MRR)
 */
function normalizeToMRR(amount, billingPeriod) {
  const numeric = Number(amount || 0);
  switch ((billingPeriod || 'MONTHLY').toUpperCase()) {
    case 'DAILY':
      return Number((numeric * 30).toFixed(2));
    case 'WEEKLY':
      return Number(((numeric * 52) / 12).toFixed(2));
    case 'YEARLY':
      return Number((numeric / 12).toFixed(2));
    case 'MONTHLY':
    default:
      return Number(numeric.toFixed(2));
  }
}

// Sample dataset used when queried standalone in Hour 2
const sampleSubscriptions = [
  {
    id: 101,
    subscriptionNumber: 'SUB-2026-0101',
    customerName: 'Acme Retail Pvt Ltd',
    planName: 'Brightloop Enterprise Yearly',
    billingPeriod: 'YEARLY',
    status: 'ACTIVE',
    recurringAmount: 27100,
  },
  {
    id: 102,
    subscriptionNumber: 'SUB-2026-0102',
    customerName: 'Nova Studio LLP',
    planName: 'Brightloop Growth Monthly',
    billingPeriod: 'MONTHLY',
    status: 'ACTIVE',
    recurringAmount: 7800,
  },
  {
    id: 103,
    subscriptionNumber: 'SUB-2026-0103',
    customerName: 'Apex Cloud Systems',
    planName: 'Brightloop Starter Weekly',
    billingPeriod: 'WEEKLY',
    status: 'ACTIVE',
    recurringAmount: 1900,
  },
];

const sampleInvoices = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0001',
    subscriptionNumber: 'SUB-2026-0100',
    customerName: 'Zenith Logistics',
    customerEmail: 'finance@zenithlogistics.com',
    planName: 'Brightloop Growth Monthly',
    status: 'CONFIRMED',
    issueDate: new Date('2026-10-01T00:00:00Z'),
    dueDate: new Date('2026-10-15T00:00:00Z'),
    totalAmount: 12960,
    amountPaid: 5000,
    amountDue: 7960,
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0002',
    subscriptionNumber: 'SUB-2026-0095',
    customerName: 'Metro Mart Retail',
    customerEmail: 'accounts@metromart.in',
    planName: 'Brightloop Enterprise Yearly',
    status: 'CONFIRMED',
    issueDate: new Date('2026-09-15T00:00:00Z'),
    dueDate: new Date('2026-09-25T00:00:00Z'),
    totalAmount: 28320,
    amountPaid: 0,
    amountDue: 28320,
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-0003',
    subscriptionNumber: 'SUB-2026-0101',
    customerName: 'Acme Retail Pvt Ltd',
    customerEmail: 'billing@acmeretail.in',
    planName: 'Brightloop Enterprise Yearly',
    status: 'PAID',
    issueDate: new Date('2026-10-05T00:00:00Z'),
    dueDate: new Date('2026-10-20T00:00:00Z'),
    totalAmount: 31978,
    amountPaid: 31978,
    amountDue: 0,
  },
];

const samplePayments = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0001',
    customerName: 'Zenith Logistics',
    amount: 5000,
    paymentMethod: 'BANK_TRANSFER',
    paymentDate: new Date('2026-10-05T10:30:00Z'),
    note: 'NEFT UTR #HDFC0092817',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0003',
    customerName: 'Acme Retail Pvt Ltd',
    amount: 31978,
    paymentMethod: 'UPI',
    paymentDate: new Date('2026-10-08T14:15:00Z'),
    note: 'Corporate UPI AutoPay',
  },
];

// ---------------------------------------------------------------------------
// 1. GET /api/billing/reports/mrr-breakdown
//    Returns MRR, ARR, and revenue grouped by Plan & Billing Cycle (<2s)
// ---------------------------------------------------------------------------
exports.getMRRBreakdown = async (req, res) => {
  const startTime = Date.now();
  try {
    const byPlan = {};
    let totalMRR = 0;

    for (const sub of sampleSubscriptions) {
      if (sub.status !== 'ACTIVE') continue;
      const mrr = normalizeToMRR(sub.recurringAmount, sub.billingPeriod);
      totalMRR += mrr;

      if (!byPlan[sub.planName]) {
        byPlan[sub.planName] = {
          planName: sub.planName,
          billingPeriod: sub.billingPeriod,
          activeSubscribers: 0,
          mrr: 0,
          arr: 0,
        };
      }
      byPlan[sub.planName].activeSubscribers += 1;
      byPlan[sub.planName].mrr = Number((byPlan[sub.planName].mrr + mrr).toFixed(2));
      byPlan[sub.planName].arr = Number((byPlan[sub.planName].mrr * 12).toFixed(2));
    }

    return res.status(200).json({
      success: true,
      executionTimeMs: Date.now() - startTime,
      totalMRR: Number(totalMRR.toFixed(2)),
      totalARR: Number((totalMRR * 12).toFixed(2)),
      planBreakdown: Object.values(byPlan),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute MRR breakdown',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// 2. GET /api/billing/reports/overdue-aging
//    Returns overdue invoices grouped by aging bucket (1-7d, 8-30d, 30d+)
// ---------------------------------------------------------------------------
exports.getOverdueAgingReport = async (req, res) => {
  const startTime = Date.now();
  try {
    const report = scanOverdueReceivables(sampleInvoices);
    return res.status(200).json({
      success: true,
      executionTimeMs: Date.now() - startTime,
      ...report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate overdue aging report',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// 3. POST /api/billing/reports/chase-overdue
//    Sends overdue reminders to one or all overdue invoices
// ---------------------------------------------------------------------------
exports.triggerOverdueChase = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const overdueScan = scanOverdueReceivables(sampleInvoices);
    const allOverdue = [
      ...overdueScan.buckets['1_TO_7_DAYS'].invoices,
      ...overdueScan.buckets['8_TO_30_DAYS'].invoices,
      ...overdueScan.buckets.OVER_30_DAYS.invoices,
    ];

    const targets = invoiceId
      ? allOverdue.filter((i) => i.id === Number(invoiceId))
      : allOverdue;

    const results = targets.map((inv) => chaseOverdueInvoice(inv, 'FINANCE_LEAD'));
    const sentCount = results.filter((r) => r.chased).length;

    return res.status(200).json({
      success: true,
      message: `Sent ${sentCount} overdue payment reminder(s); ${
        results.length - sentCount
      } skipped (already reminded today).`,
      sentCount,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to chase overdue invoices',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// 4. GET /api/billing/reports/reconciliation
//    Groups recorded payments by method (Bank Transfer, UPI, Card, Cash)
// ---------------------------------------------------------------------------
exports.getPaymentReconciliation = async (req, res) => {
  const startTime = Date.now();
  try {
    const byMethod = {
      BANK_TRANSFER: { method: 'BANK_TRANSFER', count: 0, totalAmount: 0 },
      UPI: { method: 'UPI', count: 0, totalAmount: 0 },
      CARD: { method: 'CARD', count: 0, totalAmount: 0 },
      CASH: { method: 'CASH', count: 0, totalAmount: 0 },
    };

    for (const p of samplePayments) {
      const key = byMethod[p.paymentMethod] ? p.paymentMethod : 'BANK_TRANSFER';
      byMethod[key].count += 1;
      byMethod[key].totalAmount = Number((byMethod[key].totalAmount + p.amount).toFixed(2));
    }

    return res.status(200).json({
      success: true,
      executionTimeMs: Date.now() - startTime,
      methods: Object.values(byMethod),
      payments: samplePayments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reconcile payments',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// 5. GET /api/billing/reports/export-csv
//    Exports end-of-month invoice & payment ledger as CSV
// ---------------------------------------------------------------------------
exports.exportFinanceCSV = async (req, res) => {
  try {
    const headers = [
      'InvoiceNumber',
      'SubscriptionNumber',
      'CustomerName',
      'PlanName',
      'Status',
      'IssueDate',
      'DueDate',
      'TotalAmount',
      'AmountPaid',
      'AmountDue',
    ];
    const rows = sampleInvoices.map((inv) =>
      [
        inv.invoiceNumber,
        inv.subscriptionNumber,
        `"${inv.customerName}"`,
        `"${inv.planName}"`,
        inv.status,
        new Date(inv.issueDate).toISOString().slice(0, 10),
        new Date(inv.dueDate).toISOString().slice(0, 10),
        inv.totalAmount,
        inv.amountPaid,
        inv.amountDue,
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="brightloop_finance_report_2026_10.csv"'
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to export finance CSV',
      error: error.message,
    });
  }
};

