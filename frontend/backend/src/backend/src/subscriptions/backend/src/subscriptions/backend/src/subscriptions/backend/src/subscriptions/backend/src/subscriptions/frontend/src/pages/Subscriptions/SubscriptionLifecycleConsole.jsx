import React, { useState, useMemo } from 'react';
const INITIAL_SUBSCRIPTIONS = [
  {
    id: 'SUB-2026-001',
    subscriptionNumber: 'BL-SUB-0001',
    customerName: 'Kochi Metro Logistics Pvt Ltd',
    customerEmail: 'finance@kochimetrologistics.in',
    planName: 'Standard Monthly Plan',
    billingPeriod: 'MONTHLY',
    status: 'ACTIVE',
    startDate: '2026-10-01',
    expirationDate: '2027-10-01',
    discountCode: 'MAKEATON20',
    productName: 'Brightloop Enterprise Cloud ERP',
    variantLabel: 'Brand: Odoo (+₹560)',
    quantity: 5,
    unitPrice: 2400,
    variantSurcharge: 560,
    discountPercent: 20,
    gstPercent: 18
  },
  {
    id: 'SUB-2026-002',
    subscriptionNumber: 'BL-SUB-0002',
    customerName: 'Malabar Spice Exports Ltd',
    customerEmail: 'accounts@malabarspice.com',
    planName: 'Enterprise Annual Plan',
    billingPeriod: 'YEARLY',
    status: 'QUOTATION_SENT',
    startDate: '2026-10-25',
    expirationDate: '2027-10-25',
    discountCode: 'MAKEATON20',
    productName: 'Brightloop AI Analytics & Forecasting Add-on',
    variantLabel: 'Brand: Odoo (+₹560)',
    quantity: 6,
    unitPrice: 1200,
    variantSurcharge: 560,
    discountPercent: 20,
    gstPercent: 18
  },
  {
    id: 'SUB-2026-003',
    subscriptionNumber: 'BL-SUB-0003',
    customerName: 'Technopark Trivandrum Digital Hub',
    customerEmail: 'ops@technopark.in',
    planName: 'Standard Monthly Plan',
    billingPeriod: 'MONTHLY',
    status: 'DRAFT',
    startDate: '2026-10-31',
    expirationDate: '2027-10-31',
    discountCode: 'NONE',
    productName: 'Brightloop Enterprise Cloud ERP',
    variantLabel: 'Brand: Odoo (+₹560)',
    quantity: 3,
    unitPrice: 2400,
    variantSurcharge: 560,
    discountPercent: 0,
    gstPercent: 18
  }
];

const STATUS_BADGE_STYLES = {
  DRAFT: { background: '#f1f5f9', color: '#334155', label: 'Draft' },
  QUOTATION_SENT: { background: '#fef3c7', color: '#b45309', label: 'Quotation Sent' },
  CONFIRMED: { background: '#dbeafe', color: '#1d4ed8', label: 'Confirmed' },
  ACTIVE: { background: '#dcfce7', color: '#15803d', label: 'Active' },
  PAUSED: { background: '#ffedd5', color: '#c2410c', label: 'Paused' },
  CLOSED: { background: '#e2e8f0', color: '#475569', label: 'Closed' },
  CANCELLED: { background: '#fee2e2', color: '#b91c1c', label: 'Cancelled' }
};

export default function SubscriptionLifecycleConsole() {
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSubId, setSelectedSubId] = useState('SUB-2026-001');
  const [newCustomer, setNewCustomer] = useState('');
  const [newQty, setNewQty] = useState(4);
  const [useOdooVariant, setUseOdooVariant] = useState(true);
  const [applyMakeATonDiscount, setApplyMakeATonDiscount] = useState(true);

  const computeTotals = (sub) => {
    const effectiveUnit = sub.unitPrice + (sub.variantSurcharge || 0);
    const gross = effectiveUnit * sub.quantity;
    const discount = Number(((gross * (sub.discountPercent || 0)) / 100).toFixed(2));
    const taxable = gross - discount;
    const gst = Number(((taxable * (sub.gstPercent || 18)) / 100).toFixed(2));
    const total = Number((taxable + gst).toFixed(2));
    return { effectiveUnit, gross, discount, taxable, gst, total };
  };

  const filteredSubscriptions = useMemo(() => {
    if (statusFilter === 'ALL') return subscriptions;
    return subscriptions.filter((s) => s.status === statusFilter);
  }, [subscriptions, statusFilter]);

  const selectedSub = useMemo(
    () => subscriptions.find((s) => s.id === selectedSubId) || subscriptions[0],
    [subscriptions, selectedSubId]
  );

  const handleTransition = (id, targetStatus) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: targetStatus } : s))
    );
  };

  const handleCreateDraft = (e) => {
    e.preventDefault();
    if (!newCustomer.trim()) return;
    const nextNum = subscriptions.length + 1;
    const created = {
      id: `SUB-2026-00${nextNum}`,
      subscriptionNumber: `BL-SUB-000${nextNum}`,
      customerName: newCustomer.trim(),
      customerEmail: `billing@${newCustomer.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
      planName: 'Standard Monthly Plan',
      billingPeriod: 'MONTHLY',
      status: 'DRAFT',
      startDate: '2026-10-31',
      expirationDate: '2027-10-31',
      discountCode: applyMakeATonDiscount ? 'MAKEATON20' : 'NONE',
      productName: 'Brightloop Enterprise Cloud ERP',
      variantLabel: useOdooVariant ? 'Brand: Odoo (+₹560)' : 'Standard Edition',
      quantity: Number(newQty) || 1,
      unitPrice: 2400,
      variantSurcharge: useOdooVariant ? 560 : 0,
      discountPercent: applyMakeATonDiscount ? 20 : 0,
      gstPercent: 18
    };
    setSubscriptions([created, ...subscriptions]);
    setSelectedSubId(created.id);
    setNewCustomer('');
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#0f172a', background: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#1e1b4b' }}>
            Scene 3: Subscription Lifecycle & Quotation Engine
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>
            Module Owner: Alfiya S • Automated State Machine (Draft → Quotation Sent → Confirmed → Active)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'DRAFT', 'QUOTATION_SENT', 'ACTIVE', 'PAUSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: statusFilter === st ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                background: statusFilter === st ? '#4f46e5' : '#ffffff',
                color: statusFilter === st ? '#ffffff' : '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Subscription Quotation Builder */}
      <form
        onSubmit={handleCreateDraft}
        style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="text"
          placeholder="Customer Organization Name..."
          value={newCustomer}
          onChange={(e) => setNewCustomer(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 220px' }}
        />
        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Seats:
          <input
            type="number"
            min="1"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            style={{ width: '64px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={useOdooVariant}
            onChange={(e) => setUseOdooVariant(e.target.checked)}
          />
          Brand: Odoo (+₹560/seat)
        </label>
        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={applyMakeATonDiscount}
            onChange={(e) => setApplyMakeATonDiscount(e.target.checked)}
          />
          Apply MAKEATON20 (-20%)
        </label>
        <button
          type="submit"
          style={{
            background: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            padding: '9px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + Create Subscription Draft
        </button>
      </form>

      {/* Master-Detail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Subscription</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Plan</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Recurring Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => {
                const badge = STATUS_BADGE_STYLES[sub.status] || STATUS_BADGE_STYLES.DRAFT;
                const totals = computeTotals(sub);
                return (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: selectedSub.id === sub.id ? '#eef2ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: 600, color: '#4f46e5' }}>{sub.subscriptionNumber}</td>
                    <td style={{ padding: '12px' }}>{sub.customerName}</td>
                    <td style={{ padding: '12px' }}>{sub.billingPeriod}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          background: badge.background,
                          color: badge.color,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>
                      ₹{totals.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Subscription Lifecycle Stepper & Breakdown */}
        {selectedSub && (
          <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '17px' }}>
                {selectedSub.subscriptionNumber} — {selectedSub.customerName}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Start: {selectedSub.startDate}</span>
            </div>

            <div style={{ marginTop: '14px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px' }}>
              <div><strong>Product:</strong> {selectedSub.productName}</div>
              <div><strong>Variant Surcharge:</strong> {selectedSub.variantLabel}</div>
              <div><strong>Quantity:</strong> {selectedSub.quantity} Seats</div>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />
              {(() => {
                const t = computeTotals(selectedSub);
                return (
                  <div style={{ lineHeight: 1.7 }}>
                    <div>Gross Subtotal: <strong>₹{t.gross.toLocaleString('en-IN')}</strong></div>
                    <div style={{ color: '#16a34a' }}>
                      Discount ({selectedSub.discountCode}): <strong>-₹{t.discount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>Taxable Subtotal: <strong>₹{t.taxable.toLocaleString('en-IN')}</strong></div>
                    <div>GST (18%): <strong>₹{t.gst.toLocaleString('en-IN')}</strong></div>
                    <div style={{ fontSize: '15px', color: '#4f46e5', marginTop: '4px' }}>
                      Total Recurring Invoice: <strong>₹{t.total.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedSub.status === 'DRAFT' && (
                <button
                  onClick={() => handleTransition(selectedSub.id, 'QUOTATION_SENT')}
                  style={{ padding: '8px 12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Send Quotation
                </button>
              )}
              {(selectedSub.status === 'DRAFT' || selectedSub.status === 'QUOTATION_SENT') && (
                <button
                  onClick={() => handleTransition(selectedSub.id, 'CONFIRMED')}
                  style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Confirm Order
                </button>
              )}
              {selectedSub.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleTransition(selectedSub.id, 'ACTIVE')}
                  style={{ padding: '8px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Activate Recurring Billing
                </button>
              )}
              {selectedSub.status === 'ACTIVE' && (
                <button
                  onClick={() => handleTransition(selectedSub.id, 'PAUSED')}
                  style={{ padding: '8px 12px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Pause Subscription
                </button>
              )}
              {selectedSub.status === 'PAUSED' && (
                <button
                  onClick={() => handleTransition(selectedSub.id, 'ACTIVE')}
                  style={{ padding: '8px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Resume Subscription
                </button>
              )}
              {selectedSub.status !== 'CLOSED' && (
                <button
                  onClick={() => handleTransition(selectedSub.id, 'CLOSED')}
                  style={{ padding: '8px 12px', background: '#475569', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Close Contract
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
