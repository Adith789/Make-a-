import React, { useState } from 'react';

/**
 * Brightloop Software — Subscription Management System
 * Hour 3 Frontend Component: Interactive Billing Day Batch Console & 3-Stage Invoice Stepper
 * Owner: Abhijith B S
 * Place at: frontend/src/pages/Finance/BillingDayBatchConsole.jsx
 *
 * Implements Scene 4 ("Billing day"):
 *  - Previews due ACTIVE subscriptions with product lines, Odoo +560 variant surcharges,
 *    automatic Admin taxes, and automatic Admin discount rules.
 *  - Runs idempotent Billing Day batch (never bills twice or skips).
 *  - Visual 3-stage stepper: Draft -> Confirmed -> Paid with Confirm, Send, Print, Cancel.
 */

const DUE_SUBSCRIPTIONS_QUEUE = [
  {
    id: 101,
    subscriptionNumber: 'SUB-2026-0101',
    customerName: 'Acme Retail Pvt Ltd',
    customerEmail: 'billing@acmeretail.in',
    planName: 'Brightloop Enterprise Yearly',
    billingPeriod: 'YEARLY',
    nextBillingDate: '2026-10-31',
    productSummary: '10x Brightloop ERP Core (Brand: Odoo +560) + 1x Priority Support',
    subtotal: 27100,
    discountCode: 'SEATS10 (10% Auto-Rule)',
    discountAmount: 2710,
    taxAmount: 4390.2,
    totalAmount: 28780.2,
  },
  {
    id: 102,
    subscriptionNumber: 'SUB-2026-0102',
    customerName: 'Nova Studio LLP',
    customerEmail: 'accounts@novastudio.io',
    planName: 'Brightloop Growth Monthly',
    billingPeriod: 'MONTHLY',
    nextBillingDate: '2026-10-31',
    productSummary: '5x Brightloop CRM Suite (Brand: Odoo +560)',
    subtotal: 7800,
    discountCode: 'SEATS10 (10% Auto-Rule)',
    discountAmount: 780,
    taxAmount: 1263.6,
    totalAmount: 8283.6,
  },
];

const STAGES = ['DRAFT', 'CONFIRMED', 'PAID'];

export default function BillingDayBatchConsole() {
  const [billedIds, setBilledIds] = useState([]);
  const [generatedInvoices, setGeneratedInvoices] = useState([]);
  const [batchLog, setBatchLog] = useState(null);

  const handleRunBillingBatch = () => {
    const newlyCreated = [];
    const skippedDuplicates = [];

    for (const sub of DUE_SUBSCRIPTIONS_QUEUE) {
      if (billedIds.includes(sub.id)) {
        skippedDuplicates.push(sub.subscriptionNumber);
        continue;
      }

      newlyCreated.push({
        id: Date.now() + sub.id,
        invoiceNumber: `INV-2026-0${sub.id}`,
        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerName: sub.customerName,
        customerEmail: sub.customerEmail,
        planName: sub.planName,
        productSummary: sub.productSummary,
        subtotal: sub.subtotal,
        discountCode: sub.discountCode,
        discountTotal: sub.discountAmount,
        taxTotal: sub.taxAmount,
        totalAmount: sub.totalAmount,
        status: 'DRAFT',
        sentToCustomer: false,
      });
    }

    if (newlyCreated.length > 0) {
      setBilledIds((prev) => [...prev, ...newlyCreated.map((i) => i.subscriptionId)]);
      setGeneratedInvoices((prev) => [...newlyCreated, ...prev]);
    }

    setBatchLog({
      createdCount: newlyCreated.length,
      skippedCount: skippedDuplicates.length,
      skippedList: skippedDuplicates,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleAdvanceStatus = (id, nextStatus) => {
    setGeneratedInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: nextStatus } : inv))
    );
  };

  const handleSendInvoice = (id) => {
    setGeneratedInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, sentToCustomer: true } : inv))
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            Scene 4 — Automated Billing Day Engine
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Due Subscriptions Batch Queue &amp; Invoice Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Creates invoices from active subscriptions with taxes &amp; discounts pre-filled.
            Idempotency guard prevents double-billing.
          </p>
        </div>

        <button
          onClick={handleRunBillingBatch}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        >
          Run Billing Day Batch ({DUE_SUBSCRIPTIONS_QUEUE.length} Due)
        </button>
      </div>

      {/* Idempotency Execution Log */}
      {batchLog && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="font-bold text-emerald-400">
              [{batchLog.timestamp}] Batch Complete:
            </span>{' '}
            {batchLog.createdCount} invoice(s) generated in DRAFT state •{' '}
            <span className="text-amber-300 font-semibold">
              {batchLog.skippedCount} duplicate(s) blocked by idempotency guard
            </span>
            {batchLog.skippedList.length > 0 && ` (${batchLog.skippedList.join(', ')})`}
          </div>
          <button
            onClick={() => setBatchLog(null)}
            className="text-slate-300 underline text-[11px]"
          >
            Clear Log
          </button>
        </div>
      )}

      {/* Due Subscriptions Queue Table */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Subscriptions Due Today
        </h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 px-4">Subscription</th>
                <th className="py-2.5 px-4">Customer &amp; Plan</th>
                <th className="py-2.5 px-4">Product Lines &amp; Variant</th>
                <th className="py-2.5 px-4 text-right">Auto-Discount</th>
                <th className="py-2.5 px-4 text-right">Auto-Tax (18%)</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-right">Billing State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DUE_SUBSCRIPTIONS_QUEUE.map((sub) => {
                const isBilled = billedIds.includes(sub.id);
                return (
                  <tr key={sub.id}>
                    <td className="py-3 px-4 font-semibold text-indigo-700">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{sub.customerName}</div>
                      <div className="text-xs text-slate-500">{sub.planName}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{sub.productSummary}</td>
                    <td className="py-3 px-4 text-right text-xs text-emerald-700 font-medium">
                      -₹{sub.discountAmount.toLocaleString()}
                      <div className="text-[10px] text-slate-400">{sub.discountCode}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-xs">
                      ₹{sub.taxAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      ₹{sub.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isBilled ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Billed (Protected)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Due Today
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Invoices with 3-Stage Stepper (Draft -> Confirmed -> Paid) */}
      {generatedInvoices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Generated Billing Day Invoices (Draft → Confirmed → Paid)
          </h3>
          {generatedInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-700">{inv.invoiceNumber}</span>
                  <span className="text-xs text-slate-500">• {inv.customerName}</span>
                  {inv.sentToCustomer && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                      Sent to {inv.customerEmail}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {inv.productSummary} — Total:{' '}
                  <strong className="text-slate-900">₹{inv.totalAmount.toLocaleString()}</strong>
                </p>
              </div>

              {/* 3-Stage Visual Pipeline Stepper */}
              <div className="flex items-center gap-2">
                {STAGES.map((stage, index) => {
                  const activeIdx = STAGES.indexOf(inv.status);
                  const isCompletedOrActive = activeIdx >= index && inv.status !== 'CANCELLED';
                  return (
                    <div key={stage} className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isCompletedOrActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {index + 1}. {stage}
                      </span>
                      {index < STAGES.length - 1 && <span className="text-slate-400">→</span>}
                    </div>
                  );
                })}
                {inv.status === 'CANCELLED' && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700">
                    CANCELLED
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {inv.status === 'DRAFT' && (
                  <button
                    onClick={() => handleAdvanceStatus(inv.id, 'CONFIRMED')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Confirm Invoice
                  </button>
                )}
                {inv.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleAdvanceStatus(inv.id, 'PAID')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Mark Paid
                  </button>
                )}
                <button
                  onClick={() => handleSendInvoice(inv.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Send
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Print
                </button>
                {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleAdvanceStatus(inv.id, 'CANCELLED')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
