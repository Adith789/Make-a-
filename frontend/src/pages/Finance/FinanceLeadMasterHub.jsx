import React, { useState } from 'react';
import FinanceDashboard from './FinanceDashboard';
import OverdueAndRevenueAnalytics from './OverdueAndRevenueAnalytics';
import BillingDayBatchConsole from './BillingDayBatchConsole';
import PaymentMatchingLedger from './PaymentMatchingLedger';

/**
 * Brightloop Software — Subscription Management System
 * Hour 4 Final Master View: Unified Billing Day, Payments & Finance Lead Hub
 * Owner: Abhijith B S
 * Place at: frontend/src/pages/Finance/FinanceLeadMasterHub.jsx
 *
 * Unifies all Hour 1–4 components into a single navigation hub:
 *  - Tab 1: End-of-Month Finance Lead Overview (<2s SLA Benchmark)
 *  - Tab 2: Automated Billing Day Batch Console & 3-Stage Stepper (Scene 4)
 *  - Tab 3: Incoming Payment Matching Desk & Receivables Ledger (Scene 6)
 *  - Tab 4: Overdue Invoice Chaser & MRR/ARR Plan Breakdown (Scene 6 & 7)
 */

const VIEWS = [
  { id: 'OVERVIEW', label: '1. Finance Lead Overview (<2s)' },
  { id: 'BILLING_DAY', label: '2. Billing Day Batch (Scene 4)' },
  { id: 'PAYMENTS_DESK', label: '3. Payment Matching (Scene 6)' },
  { id: 'OVERDUE_MRR', label: '4. Overdue Chaser & MRR (Scene 7)' },
];

export default function FinanceLeadMasterHub() {
  const [activeView, setActiveView] = useState('OVERVIEW');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top Argon Command Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
              BL
            </span>
            <div>
              <h1 className="text-sm font-bold tracking-tight">
                Brightloop Software — Recurring Billing &amp; Finance Command Center
              </h1>
              <p className="text-[11px] text-slate-400">
                Module 4 • Automated Invoicing, Payment Reconciliation &amp; Sub-2-Second Analytics
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-1.5">
            {VIEWS.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === view.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {view.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Active Module Workspace */}
      <main className="max-w-7xl mx-auto p-6">
        {activeView === 'OVERVIEW' && <FinanceDashboard />}
        {activeView === 'BILLING_DAY' && <BillingDayBatchConsole />}
        {activeView === 'PAYMENTS_DESK' && <PaymentMatchingLedger />}
        {activeView === 'OVERDUE_MRR' && <OverdueAndRevenueAnalytics />}
      </main>
    </div>
  );
}
