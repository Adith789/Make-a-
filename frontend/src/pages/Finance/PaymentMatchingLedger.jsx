import React, { useState } from 'react';

/**
 * Brightloop Software — Subscription Management System
 * Hour 3 Frontend Component: Incoming Payment Matching & Receivables Ledger
 * Owner: Abhijith B S
 * Place at: frontend/src/pages/Finance/PaymentMatchingLedger.jsx
 *
 * Implements Scene 6 ("The money comes in"):
 *  - Records incoming payments with Method, Amount, Date, and Note against the right invoice.
 *  - Shows real-time Paid vs. Still Outstanding invoices so nothing is matched by hand.
 */

const INITIAL_INVOICES = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0001',
    customerName: 'Zenith Logistics',
    totalAmount: 12960,
    amountPaid: 5000,
    amountDue: 7960,
    status: 'CONFIRMED',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0002',
    customerName: 'Metro Mart Retail',
    totalAmount: 28320,
    amountPaid: 0,
    amountDue: 28320,
    status: 'CONFIRMED',
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-0003',
    customerName: 'Acme Retail Pvt Ltd',
    totalAmount: 31978,
    amountPaid: 31978,
    amountDue: 0,
    status: 'PAID',
  },
];

const INITIAL_PAYMENTS = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0001',
    customerName: 'Zenith Logistics',
    method: 'BANK_TRANSFER',
    amount: 5000,
    date: '2026-10-05',
    note: 'NEFT Partial Settlement #HDFC9182',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0003',
    customerName: 'Acme Retail Pvt Ltd',
    method: 'UPI',
    amount: 31978,
    date: '2026-10-08',
    note: 'Full Yearly Plan UPI AutoPay',
  },
];

export default function PaymentMatchingLedger() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('1');
  const [method, setMethod] = useState('BANK_TRANSFER');
  const [amount, setAmount] = useState('7960');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const outstandingInvoices = invoices.filter((i) => i.amountDue > 0);

  const handleSelectInvoice = (idStr) => {
    setSelectedInvoiceId(idStr);
    const target = invoices.find((i) => String(i.id) === String(idStr));
    if (target) {
      setAmount(String(target.amountDue));
    }
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;

    const targetInvoice = invoices.find((i) => String(i.id) === String(selectedInvoiceId));
    if (!targetInvoice) return;

    const newPayment = {
      id: payments.length + 1,
      invoiceNumber: targetInvoice.invoiceNumber,
      customerName: targetInvoice.customerName,
      method,
      amount: numericAmount,
      date,
      note: note || 'Matched via Brightloop Payment Desk',
    };

    setPayments((prev) => [newPayment, ...prev]);

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== targetInvoice.id) return inv;
        const updatedPaid = Number((inv.amountPaid + numericAmount).toFixed(2));
        const updatedDue = Math.max(0, Number((inv.totalAmount - updatedPaid).toFixed(2)));
        return {
          ...inv,
          amountPaid: updatedPaid,
          amountDue: updatedDue,
          status: updatedDue === 0 ? 'PAID' : 'CONFIRMED',
        };
      })
    );

    setNote('');
  };

  const visiblePayments = payments.filter(
    (p) => methodFilter === 'ALL' || p.method === methodFilter
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          Scene 6 — Incoming Payment Matching
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Payment Recording Desk &amp; Paid vs. Outstanding Tracker
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Record Payment Form */}
        <form
          onSubmit={handleRecordPayment}
          className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
        >
          <h3 className="text-sm font-bold text-slate-900">Record New Payment Against Invoice</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Select Outstanding Invoice
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleSelectInvoice(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
            >
              {outstandingInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customerName} (Due: ₹{inv.amountDue})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Payment Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Transaction Note</label>
            <input
              type="text"
              placeholder="UTR / Bank Reference / Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={outstandingInvoices.length === 0}
            className="w-full py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Match &amp; Record Payment
          </button>
        </form>

        {/* Right: Live Paid vs. Still Outstanding Invoice Status + Payment Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className={`p-3.5 rounded-xl border ${
                  inv.amountDue === 0
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{inv.invoiceNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.amountDue === 0
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {inv.amountDue === 0 ? 'PAID' : 'OUTSTANDING'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{inv.customerName}</p>
                <p className="text-xs font-semibold mt-2">
                  Paid: ₹{inv.amountPaid.toLocaleString()} / ₹{inv.totalAmount.toLocaleString()}
                </p>
                {inv.amountDue > 0 && (
                  <p className="text-xs font-bold text-rose-700">
                    Still Owed: ₹{inv.amountDue.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Recorded Payments Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Matched Payments History ({visiblePayments.length})
              </span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white text-xs"
              >
                <option value="ALL">All Methods</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3">Invoice</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Note</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {visiblePayments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-bold text-indigo-700">{p.invoiceNumber}</td>
                    <td className="py-2.5 px-3">{p.customerName}</td>
                    <td className="py-2.5 px-3 font-semibold">{p.method}</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.date}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.note}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      ₹{p.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
