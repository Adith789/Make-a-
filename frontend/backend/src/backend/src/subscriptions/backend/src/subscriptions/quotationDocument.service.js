function generateQuotationHtml(subscription) {
  const pricing = subscription.pricingSummary || {
    grossSubtotal: 0,
    discountAmount: 0,
    taxableSubtotal: 0,
    totalTaxAmount: 0,
    grandTotal: 0,
    computedLines: []
  };

  const rowsHtml = (pricing.computedLines || [])
    .map(
      (line) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${line.productName}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${line.variantLabel || '-'} (+INR ${line.variantSurcharge || 0})</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${line.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">INR ${line.effectiveUnitPrice.toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">INR ${line.lineSubtotal.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subscription Quotation – ${subscription.subscriptionNumber}</title>
</head>
<body style="font-family:Inter,Arial,sans-serif;color:#0f172a;padding:24px;max-width:800px;margin:0 auto;">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #4f46e5;padding-bottom:16px;">
    <div>
      <h1 style="margin:0;color:#4f46e5;font-size:22px;">Brightloop Software Pvt. Ltd.</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#475569;">Subscription Quotation & Recurring Order Contract</p>
    </div>
    <div style="text-align:right;">
      <span style="background:#eef2ff;color:#4338ca;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;">
        ${subscription.status}
      </span>
      <p style="margin:6px 0 0;font-size:13px;"><strong>Ref:</strong> ${subscription.subscriptionNumber}</p>
    </div>
  </div>

  <div style="margin-top:16px;display:flex;justify-content:space-between;font-size:13px;">
    <div>
      <strong>Customer:</strong> ${subscription.customerName}<br/>
      <strong>Email:</strong> ${subscription.customerEmail}<br/>
      <strong>Payment Terms:</strong> ${subscription.paymentTerms}
    </div>
    <div style="text-align:right;">
      <strong>Billing Plan:</strong> ${subscription.planId} (${subscription.billingPeriod})<br/>
      <strong>Start Date:</strong> ${subscription.startDate}<br/>
      <strong>Expiration Date:</strong> ${subscription.expirationDate}
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:13px;">
    <thead>
      <tr style="background:#f8fafc;text-align:left;">
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;">Product</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;">Variant Add-on</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;text-align:right;">Qty</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;text-align:right;">Unit Price</th>
        <th style="padding:8px;border-bottom:2px solid #cbd5e1;text-align:right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div style="margin-top:20px;text-align:right;font-size:13px;line-height:1.7;">
    <div>Gross Subtotal: <strong>INR ${pricing.grossSubtotal.toFixed(2)}</strong></div>
    <div>Discount (${subscription.discountCode || 'None'}): <strong style="color:#16a34a;">-INR ${pricing.discountAmount.toFixed(2)}</strong></div>
    <div>Taxable Base: <strong>INR ${pricing.taxableSubtotal.toFixed(2)}</strong></div>
    <div>GST & Active Taxes: <strong>INR ${pricing.totalTaxAmount.toFixed(2)}</strong></div>
    <div style="font-size:16px;color:#4f46e5;margin-top:6px;">
      Recurring Total (${subscription.billingPeriod}): <strong>INR ${pricing.grandTotal.toFixed(2)}</strong>
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  generateQuotationHtml
};
