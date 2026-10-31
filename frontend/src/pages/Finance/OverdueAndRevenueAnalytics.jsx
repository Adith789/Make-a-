import React, { useState } from 'react';

/**
 * Brightloop Software — Subscription Management System
 * Hour 2 Frontend Component: Overdue Invoice Chaser Console & MRR/ARR Analytics
 * Owner: Abhijith B S
 * Place at: frontend/src/pages/Finance/OverdueAndRevenueAnalytics.jsx
 */

const INITIAL_OVERDUE = [
  {
    id: 2,
    invoiceNumber: 'INV-2026-0002',
    subscriptionNumber: 'SUB-2026-0095',
    customerName: 'Metro Mart Retail',
    customerEmail: 'accounts@metromart.in',
    planName: 'Brightloop Enterprise Yearly',
    dueDate: '2026-09-25',
    daysOverdue: 36,
    agingBucket: 'OVER_30_DAYS',
    severity: 'CRITICAL',
    amountDue: 28320,
    chasedToday: false,
  },
  {
    id: 1,
    invoiceNumber: 'INV-2026-0001',
    subscriptionNumber: 'SUB-2026-0100',
    customerName: 'Zenith Logistics',
    customerEmail: 'finance@zenithlogistics.com',
    planName: 'Brightloop Growth Monthly',
    dueDate: '2026-10-15',
    daysOverdue: 16,
    agingBucket: '8_TO_30_DAYS',
    severity: 'HIGH',
    amountDue: 7960,
    chasedToday: false,
  },
];

const PLAN_MRR_DATA = [
  {
    planName: 'Brightloop Enterprise Yearly',
    billingPeriod: 'YEARLY',
    subscribers: 14,
    mrr: 31616,
    arr: 379392,
  },
  {
    planName: 'Brightloop Growth Monthly',
    billingPeriod: 'MONTHLY',
    subscribers: 28,
    mrr: 98000,
    arr: 1176000,
  },
  {
    planName: 'Brightloop Starter Weekly',
    billingPeriod: 'WEEKLY',
    subscribers: 9,
    mrr: 37050,
    arr: 444600,
  },
];

export default function OverdueAndRevenueAnalytics() {
  const [overdueList, setOverdueList] = useState(INITIAL_OVERDUE);
  const [bucketFilter, setBucketFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  const handleChaseSingle = (id) => {
    setOverdueList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, chasedToday: true } : item))
    );
    const target = overdueList.find((i) => i.id === id);
    if (target) {
      setToast(
        `Payment reminder sent to ${target.customerName} (${target.customerEmail}) for ${target.invoiceNumber}.`
      );
    }
  };

  const handleChaseAll = () => {
    const pendingCount = overdueList.filter((i) => !i.chasedToday).length;
    setOverdueList((prev) => prev.map((item) => ({ ...item, chasedToday: true })));
    setToast(`Dispatched ${pendingCount} overdue payment reminder(s) across all aging buckets.`);
  };

  const handleDownloadCSV = () => {
    const csvRows = [
      'InvoiceNumber,SubscriptionNumber,CustomerName,PlanName,DueDate,DaysOverdue,AmountDue',
      ...overdueList.map(
        (i) =>
          `${i.invoiceNumber},${i.subscriptionNumber},"${i.customerName}","${i.planName}",${i.dueDate},${i.daysOverdue},${i.amountDue}`
      ),
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brightloop_overdue_receivables.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredOverdue = overdueList.filter(
    (item) => bucketFilter === 'ALL' || item.agingBucket === bucketFilter
  );

  const totalMRR = PLAN_MRR_DATA.reduce((sum, p) => sum + p.mrr, 0);

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            Scene 6 &amp; Scene 7 — Revenue Protection
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Overdue Receivables Chaser &amp; Monthly Recurring Revenue (MRR)
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Export CSV Report
          </button>
          <button
            onClick={handleChaseAll}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
          >
            Chase All Overdue Invoices
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex justify-between items-center">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="underline font-semibold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* MRR Breakdown by Plan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Recurring Revenue Breakdown by Plan (Normalized MRR &amp; ARR)
          </h3>
          <span className="text-xs font-bold text-indigo-700">
            Total MRR: ₹{totalMRR.toLocaleString()} / mo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_MRR_DATA.map((plan) => (
            <div
              key={plan.planName}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{plan.planName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                  {plan.billingPeriod}
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">
                ₹{plan.mrr.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">/ month</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ARR: ₹{plan.arr.toLocaleString()} • {plan.subscribers} Active Subscriptions
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Aging Filter & Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Overdue Invoices Requiring Follow-Up ({filteredOverdue.length})
          </h3>
          <div className="flex gap-1.5">
            {[
              { id: 'ALL', label: 'All Overdue' },
              { id: '1_TO_7_DAYS', label: '1–7 Days' },
              { id: '8_TO_30_DAYS', label: '8–30 Days' },
              { id: 'OVER_30_DAYS', label: '30+ Days Critical' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBucketFilter(b.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  bucketFilter === b.id
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Days Overdue</th>
              <th className="py-3 px-4 text-right">Amount Owed</th>
              <th className="py-3 px-4 text-right">Follow-Up Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredOverdue.map((inv) => (
              <tr key={inv.id}>
                <td className="py-3 px-4 font-semibold text-indigo-700">{inv.invoiceNumber}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{inv.customerName}</div>
                  <div className="text-xs text-slate-500">{inv.customerEmail}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                    {inv.daysOverdue} days overdue ({inv.severity})
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-bold text-rose-700">
                  ₹{inv.amountDue.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">
                  {inv.chasedToday ? (
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Reminder Sent Today
                    </span>
                  ) : (
                    <button
                      onClick={() => handleChaseSingle(inv.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700"
                    >
                      Send Payment Reminder
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
