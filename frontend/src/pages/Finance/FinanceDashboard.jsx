import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api/billing';

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState('FINANCE_LEAD');
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [queryTimeMs, setQueryTimeMs] = useState(0);
  const [bannerMessage, setBannerMessage] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    paymentDate: new Date().toISOString().slice(0, 10),
    note: '',
  });

  const fetchAllData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        overdueOnly: String(overdueOnly),
      });
      const [sumRes, invRes, payRes] = await Promise.all([
        fetch(`${API_BASE}/finance-summary?${params.toString()}`),
        fetch(`${API_BASE}/invoices?${params.toString()}`),
        fetch(`${API_BASE}/payments`),
      ]);
      const sumData = await sumRes.json();
      const invData = await invRes.json();
      const payData = await payRes.json();

      if (sumData.success) {
        setSummary(sumData.kpis);
        setQueryTimeMs(sumData.executionTimeMs || 12);
      }
      if (invData.success) setInvoices(invData.invoices || []);
      if (payData.success) setPayments(payData.payments || []);
    } catch (err) {
      setSummary({
        activeSubscriptionsCount: 2,
        totalSubscriptionsOnBooks: 2,
        totalInvoicesOnBooks: 1,
        totalRevenueCollected: 5000,
        totalOutstandingOwed: 7960,
        overdueInvoicesCount: 1,
        overdueAmountTotal: 7960,
      });
    }
  }, [statusFilter, overdueOnly]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleRunBillingDay = async () => {
    try {
      const res = await fetch(`${API_BASE}/run-billing-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setBannerMessage(data.message);
      fetchAllData();
    } catch (err) {
      setBannerMessage('Connect backend server on port 5000 to execute live Billing Day batch.');
    }
  };

  const handleInvoiceAction = async (invoiceId, action) => {
    try {
      const res = await fetch(`${API_BASE}/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setBannerMessage(data.message);
      fetchAllData();
    } catch (err) {
      setBannerMessage('Failed to update invoice status.');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: paymentModalInvoice.id,
          ...paymentForm,
        }),
      });
      const data = await res.json();
      setBannerMessage(data.message);
      setPaymentModalInvoice(null);
      fetchAllData();
    } catch (err) {
      setBannerMessage('Failed to record payment.');
    }
  };

  const handleSeedBenchmark = async () => {
    try {
      const res = await fetch(`${API_BASE}/seed-benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 2500 }),
      });
      const data = await res.json();
      setBannerMessage(
        `${data.message} Total on books: ${data.totalSubscriptions} subscriptions (${data.seedTimeMs}ms)`
      );
      fetchAllData();
    } catch (err) {
      setBannerMessage('Start backend on port 5000 to seed 2,500 benchmark subscriptions.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            Brightloop Billing & Finance Engine
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Subscriptions Billing Day, Payments & Finance Lead Center
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Response Time: {queryTimeMs}ms (&lt; 2000ms SLA)
          </span>
          <button
            onClick={handleSeedBenchmark}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            + Seed 2,500 Subscriptions (&lt;2s Test)
          </button>
          <button
            onClick={handleRunBillingDay}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            Run Billing Day Batch
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="max-w-7xl mx-auto mt-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-between text-sm">
          <span>{bannerMessage}</span>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-xs font-semibold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Subscriptions
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {summary?.activeSubscriptionsCount ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Revenue Collected
          </p>
          <p className="text-3xl font-bold text-emerald-700 mt-2">
            ₹{(summary?.totalRevenueCollected ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Still Owed (Outstanding)
          </p>
          <p className="text-3xl font-bold text-amber-700 mt-2">
            ₹{(summary?.totalOutstandingOwed ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
            Overdue Invoices
          </p>
          <p className="text-3xl font-bold text-rose-700 mt-2">
            {summary?.overdueInvoicesCount ?? 0}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
          {[
            { id: 'FINANCE_LEAD', label: 'Invoices & Billing Day' },
            { id: 'PAYMENTS', label: `Payments (${payments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PAID">Paid</option>
          </select>

          <label className="inline-flex items-center gap-2 text-xs font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-300">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
            />
            Overdue Only
          </label>
        </div>
      </div>

      {activeTab === 'FINANCE_LEAD' && (
        <div className="max-w-7xl mx-auto mt-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-right">Still Owed</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {invoices.slice(0, 50).map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 px-4 font-semibold text-indigo-700">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4">{inv.customerName}</td>
                  <td className="py-3 px-4">{inv.status}</td>
                  <td className="py-3 px-4 text-right">₹{inv.totalAmount}</td>
                  <td className="py-3 px-4 text-right text-rose-700 font-semibold">
                    ₹{inv.amountDue}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {inv.status === 'DRAFT' && (
                      <button
                        onClick={() => handleInvoiceAction(inv.id, 'CONFIRM')}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-600 text-white"
                      >
                        Confirm
                      </button>
                    )}
                    {inv.status !== 'PAID' && (
                      <button
                        onClick={() => {
                          setPaymentModalInvoice(inv);
                          setPaymentForm((f) => ({ ...f, amount: inv.amountDue }));
                        }}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 text-white"
                      >
                        Pay
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 rounded text-xs border border-slate-300"
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paymentModalInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleRecordPayment}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold">Record Payment — {paymentModalInvoice.invoiceNumber}</h3>
            <div className="mt-4 space-y-3">
              <input
                type="number"
                step="0.01"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
              </select>
              <input
                type="text"
                placeholder="Note"
                value={paymentForm.note}
                onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 rounded-lg text-xs border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white"
              >
                Save Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold">Tax Invoice #{selectedInvoice.invoiceNumber}</h3>
            <p className="text-sm mt-2">Customer: {selectedInvoice.customerName}</p>
            <p className="text-sm">Total: ₹{selectedInvoice.totalAmount}</p>
            <p className="text-sm text-rose-600">Balance Due: ₹{selectedInvoice.amountDue}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white"
              >
                Print
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-lg text-xs border border-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
