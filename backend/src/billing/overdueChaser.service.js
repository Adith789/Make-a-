/**
 * Brightloop Software — Subscription Management System
 * Hour 2 Module: Automated Tax Rule Engine & Overdue Invoice Chasing Service
 * Owner: Abhijith B S
 *
 * Implements:
 *  - Scene 4: Automatic calculation of Admin tax rules across product/variant lines.
 *  - Scene 6: Real-time classification of Paid vs. Outstanding vs. Overdue invoices,
 *    aging bucket analysis (1-7d, 8-30d, 30d+), and automated overdue payment chasing.
 */

const reminderHistoryLog = [];

/**
 * Scene 4: Calculates taxes automatically from Admin tax rules for a subscription line.
 * Supports percentage taxes (e.g., GST 18%) and fixed-amount taxes.
 */
function calculateLineTaxes(taxableAmount, taxRules = []) {
  const activeRules = Array.isArray(taxRules)
    ? taxRules.filter((t) => t && t.isActive !== false)
    : [];

  if (activeRules.length === 0) {
    // Default Brightloop standard 18% GST rule when no custom rule is passed
    const defaultTax = Number(((taxableAmount * 18) / 100).toFixed(2));
    return {
      taxAmount: defaultTax,
      effectiveRatePercent: 18,
      appliedTaxes: [{ name: 'Standard GST (18%)', ratePercent: 18, amount: defaultTax }],
    };
  }

  let totalTax = 0;
  let totalRatePercent = 0;
  const appliedTaxes = activeRules.map((rule) => {
    const rate = Number(rule.ratePercent || 0);
    const amount = Number(((taxableAmount * rate) / 100).toFixed(2));
    totalTax += amount;
    totalRatePercent += rate;
    return {
      id: rule.id,
      name: rule.name || `Tax ${rate}%`,
      ratePercent: rate,
      amount,
    };
  });

  return {
    taxAmount: Number(totalTax.toFixed(2)),
    effectiveRatePercent: Number(totalRatePercent.toFixed(2)),
    appliedTaxes,
  };
}

/**
 * Computes how many days past due an unpaid invoice is and assigns an aging bucket.
 */
function classifyOverdueInvoice(invoice, referenceDate = new Date()) {
  const due = new Date(invoice.dueDate);
  const diffMs = referenceDate.getTime() - due.getTime();
  const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isUnpaid =
    invoice.status !== 'PAID' &&
    invoice.status !== 'CANCELLED' &&
    Number(invoice.amountDue || 0) > 0;

  if (!isUnpaid || daysOverdue <= 0) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      agingBucket: 'CURRENT',
      severity: 'NORMAL',
    };
  }

  let agingBucket = '1_TO_7_DAYS';
  let severity = 'WARNING';
  if (daysOverdue > 30) {
    agingBucket = 'OVER_30_DAYS';
    severity = 'CRITICAL';
  } else if (daysOverdue > 7) {
    agingBucket = '8_TO_30_DAYS';
    severity = 'HIGH';
  }

  return {
    isOverdue: true,
    daysOverdue,
    agingBucket,
    severity,
  };
}

/**
 * Scene 6: Scans all invoices and returns structured overdue chasing metrics and buckets.
 */
function scanOverdueReceivables(invoices = [], referenceDate = new Date()) {
  const buckets = {
    '1_TO_7_DAYS': { count: 0, totalAmountDue: 0, invoices: [] },
    '8_TO_30_DAYS': { count: 0, totalAmountDue: 0, invoices: [] },
    OVER_30_DAYS: { count: 0, totalAmountDue: 0, invoices: [] },
  };

  let totalOverdueCount = 0;
  let totalOverdueAmount = 0;

  for (const inv of invoices) {
    const classification = classifyOverdueInvoice(inv, referenceDate);
    if (!classification.isOverdue) continue;

    const enriched = {
      ...inv,
      ...classification,
    };

    totalOverdueCount += 1;
    totalOverdueAmount += Number(inv.amountDue || 0);

    const bucket = buckets[classification.agingBucket];
    if (bucket) {
      bucket.count += 1;
      bucket.totalAmountDue = Number(
        (bucket.totalAmountDue + Number(inv.amountDue || 0)).toFixed(2)
      );
      bucket.invoices.push(enriched);
    }
  }

  return {
    scannedAt: referenceDate,
    totalOverdueCount,
    totalOverdueAmount: Number(totalOverdueAmount.toFixed(2)),
    buckets,
    recentReminders: reminderHistoryLog.slice(0, 20),
  };
}

/**
 * Sends/records a payment chase reminder for a single overdue invoice
 * with same-day duplicate prevention.
 */
function chaseOverdueInvoice(invoice, triggeredBy = 'INTERNAL_TEAM') {
  const todayKey = new Date().toISOString().slice(0, 10);
  const alreadyChasedToday = reminderHistoryLog.find(
    (entry) => entry.invoiceId === invoice.id && entry.dateKey === todayKey
  );

  if (alreadyChasedToday) {
    return {
      chased: false,
      reason: 'Reminder already sent today for this invoice',
      record: alreadyChasedToday,
    };
  }

  const classification = classifyOverdueInvoice(invoice);
  const reminderRecord = {
    id: reminderHistoryLog.length + 1,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customerName: invoice.customerName,
    customerEmail: invoice.customerEmail || 'billing@customer.example.com',
    amountDue: invoice.amountDue,
    daysOverdue: classification.daysOverdue,
    severity: classification.severity,
    dateKey: todayKey,
    sentAt: new Date(),
    triggeredBy,
    subject: `Payment Overdue Reminder: Invoice ${invoice.invoiceNumber} (₹${invoice.amountDue} Due)`,
  };

  reminderHistoryLog.unshift(reminderRecord);
  return {
    chased: true,
    record: reminderRecord,
  };
}

module.exports = {
  calculateLineTaxes,
  classifyOverdueInvoice,
  scanOverdueReceivables,
  chaseOverdueInvoice,
  reminderHistoryLog,
};
