/**
 * Brightloop Software — Subscription Management System
 * Hour 3 Service: Printable Tax Invoice Generator, Email Payload Builder & State Validator
 * Owner: Abhijith B S
 *
 * Implements Scene 4 ("Billing day"):
 *  - Strict state machine enforcement: DRAFT -> CONFIRMED -> PAID (or CANCELLED)
 *  - Printable tax invoice document builder with product lines, Odoo variant surcharges,
 *    automatic Admin tax breakdown, automatic Admin discount rows, and payment stamps.
 *  - Customer invoice dispatch payload for the "Send" action.
 */

const ALLOWED_TRANSITIONS = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PAID', 'CANCELLED'],
  PAID: [], // Terminal state — paid invoices cannot be modified or cancelled
  CANCELLED: ['DRAFT'],
};

/**
 * Validates whether an invoice can move from currentStatus to targetStatus.
 */
function validateInvoiceTransition(currentStatus, targetStatus) {
  const from = (currentStatus || 'DRAFT').toUpperCase();
  const to = (targetStatus || '').toUpperCase();

  if (from === to) {
    return { allowed: true, status: to, message: `Invoice is already in ${to} state.` };
  }

  const validNext = ALLOWED_TRANSITIONS[from] || [];
  if (!validNext.includes(to)) {
    return {
      allowed: false,
      status: from,
      message: `Invalid transition from ${from} to ${to}. Allowed next states: ${
        validNext.join(', ') || 'None (Final State)'
      }`,
    };
  }

  return {
    allowed: true,
    status: to,
    message: `Invoice transitioned from ${from} to ${to}.`,
  };
}

/**
 * Builds a structured email/portal notification payload when staff clicks "Send" on an invoice.
 */
function buildInvoiceEmailPayload(invoice) {
  const dueDateFormatted = invoice.dueDate
    ? new Date(invoice.dueDate).toISOString().slice(0, 10)
    : 'Immediate';

  return {
    to: invoice.customerEmail || 'billing@customer.example.com',
    subject: `[Brightloop Software] Invoice ${invoice.invoiceNumber} for Subscription ${
      invoice.subscriptionNumber || ''
    }`,
    sentAt: new Date().toISOString(),
    summary: {
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      status: invoice.status,
      totalAmount: Number(invoice.totalAmount || 0),
      amountPaid: Number(invoice.amountPaid || 0),
      amountDue: Number(invoice.amountDue || 0),
      dueDate: dueDateFormatted,
    },
    bodyText: [
      `Hello ${invoice.customerName || 'Valued Customer'},`,
      '',
      `Your recurring subscription invoice ${invoice.invoiceNumber} (${
        invoice.planName || 'Subscription Plan'
      }) is ready.`,
      `Subtotal: ₹${Number(invoice.subtotal || 0).toLocaleString()}`,
      `Discount Applied: -₹${Number(invoice.discountTotal || 0).toLocaleString()}`,
      `Taxes: ₹${Number(invoice.taxTotal || 0).toLocaleString()}`,
      `Total Due: ₹${Number(invoice.amountDue || 0).toLocaleString()} (Due by ${dueDateFormatted})`,
      '',
      'You can view, print, or pay this invoice anytime from your Brightloop Customer Portal.',
    ].join('\n'),
  };
}

/**
 * Generates a complete, self-contained printable HTML document for an invoice ("Print" action).
 */
function buildPrintableInvoiceHTML(invoice) {
  const lines = Array.isArray(invoice.lines) ? invoice.lines : [];
  const lineRowsHtml = lines
    .map(
      (line, idx) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">
          <strong>${line.productName || 'Software Subscription'}</strong>
          <div style="font-size:12px;color:#64748b;">${line.variantLabel || 'Standard'}</div>
        </td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${
          line.quantity || 1
        }</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">₹${Number(
          line.unitPrice || 0
        ).toLocaleString()}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">₹${Number(
          line.taxAmount || 0
        ).toLocaleString()}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">₹${Number(
          line.lineTotal || 0
        ).toLocaleString()}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.invoiceNumber} — Brightloop Software</title>
</head>
<body style="font-family:Inter,Arial,sans-serif;color:#0f172a;padding:32px;max-width:800px;margin:0 auto;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #4f46e5;padding-bottom:16px;">
    <div>
      <h1 style="margin:0;color:#4f46e5;font-size:24px;">Brightloop Software</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Unified Recurring Subscription Tax Invoice</p>
    </div>
    <div style="text-align:right;">
      <div style="font-size:20px;font-weight:700;">${invoice.invoiceNumber}</div>
      <div style="font-size:12px;color:#475569;">Status: <strong>${invoice.status}</strong></div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-top:20px;font-size:13px;">
    <div>
      <strong>Billed To:</strong><br/>
      ${invoice.customerName || 'Customer'}<br/>
      ${invoice.customerEmail || ''}<br/>
      Subscription: ${invoice.subscriptionNumber || '—'}
    </div>
    <div style="text-align:right;">
      <strong>Issue Date:</strong> ${new Date(invoice.issueDate || Date.now()).toLocaleDateString()}<br/>
      <strong>Due Date:</strong> ${new Date(invoice.dueDate || Date.now()).toLocaleDateString()}<br/>
      <strong>Plan:</strong> ${invoice.planName || 'Recurring Plan'}
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-top:24px;font-size:13px;">
    <thead>
      <tr style="background:#f8fafc;text-align:left;">
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;">#</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;">Product &amp; Variant</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;text-align:right;">Qty</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;text-align:right;">Unit Price</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;text-align:right;">Tax</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineRowsHtml}
    </tbody>
  </table>

  <div style="margin-top:24px;text-align:right;font-size:14px;">
    <div>Untaxed Subtotal: <strong>₹${Number(invoice.subtotal || 0).toLocaleString()}</strong></div>
    <div style="color:#059669;margin-top:4px;">Automated Discount: <strong>-₹${Number(
      invoice.discountTotal || 0
    ).toLocaleString()}</strong></div>
    <div style="margin-top:4px;">Calculated Taxes: <strong>₹${Number(
      invoice.taxTotal || 0
    ).toLocaleString()}</strong></div>
    <div style="font-size:18px;font-weight:700;margin-top:8px;">Grand Total: ₹${Number(
      invoice.totalAmount || 0
    ).toLocaleString()}</div>
    <div style="color:#dc2626;font-weight:600;margin-top:4px;">Balance Due: ₹${Number(
      invoice.amountDue || 0
    ).toLocaleString()}</div>
  </div>
</body>
</html>`;
}

module.exports = {
  validateInvoiceTransition,
  buildInvoiceEmailPayload,
  buildPrintableInvoiceHTML,
};
