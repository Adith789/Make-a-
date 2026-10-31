import React, { useState } from 'react';
export default function PlanAndPricingConfigurator() {
  const [plans, setPlans] = useState([
    { id: 'PLAN-MONTHLY', name: 'Standard Monthly Plan', billingPeriod: 'MONTHLY', basePrice: 2400, minQuantity: 1, isPausable: true, isRenewable: true },
    { id: 'PLAN-YEARLY', name: 'Enterprise Annual Plan', billingPeriod: 'YEARLY', basePrice: 24480, minQuantity: 5, isPausable: true, isRenewable: true },
    { id: 'PLAN-WEEKLY', name: 'Agile Weekly Sprint Plan', billingPeriod: 'WEEKLY', basePrice: 650, minQuantity: 1, isPausable: false, isRenewable: true }
  ]);

  const [discounts, setDiscounts] = useState([
    { code: 'MAKEATON20', name: 'Make-A-Ton Launch 20% Off', type: 'PERCENTAGE', value: 20, minQuantity: 1 },
    { code: 'FLAT500', name: 'Enterprise Onboarding Flat ₹500 Credit', type: 'FIXED', value: 500, minQuantity: 2 }
  ]);

  const [planName, setPlanName] = useState('');
  const [planPeriod, setPlanPeriod] = useState('MONTHLY');
  const [planPrice, setPlanPrice] = useState(1800);

  const handleAddPlan = (e) => {
    e.preventDefault();
    if (!planName.trim()) return;
    setPlans([
      ...plans,
      {
        id: `PLAN-${Date.now().toString().slice(-4)}`,
        name: planName.trim(),
        billingPeriod: planPeriod,
        basePrice: Number(planPrice) || 1000,
        minQuantity: 1,
        isPausable: true,
        isRenewable: true
      }
    ]);
    setPlanName('');
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#0f172a', background: '#f8fafc' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1e1b4b' }}>
        Scenes 1 & 2: Recurring Plans, Variant Surcharges & Discount Rules
      </h2>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#475569' }}>
        Module Owner: Alfiya S • Configure Recurring Intervals, Variant Add-ons (Brand: Odoo +₹560), Promo Codes & GST
      </p>

      <form
        onSubmit={handleAddPlan}
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
          placeholder="New Recurring Plan Name..."
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 220px' }}
        />
        <select
          value={planPeriod}
          onChange={(e) => setPlanPeriod(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="DAILY">DAILY</option>
          <option value="WEEKLY">WEEKLY</option>
          <option value="MONTHLY">MONTHLY</option>
          <option value="YEARLY">YEARLY</option>
        </select>
        <input
          type="number"
          value={planPrice}
          onChange={(e) => setPlanPrice(e.target.value)}
          style={{ width: '110px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
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
          + Add Recurring Plan
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, fontSize: '16px' }}>Configured Recurring Plans</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Plan Name</th>
                <th style={{ padding: '8px' }}>Period</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Base Price</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Policies</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '8px' }}>{p.billingPeriod}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>₹{p.basePrice.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>
                    {p.isPausable ? 'Pausable • ' : ''}
                    {p.isRenewable ? 'Renewable' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, fontSize: '16px' }}>Variant Surcharges & Admin Discount Rules</h3>
          <div style={{ marginBottom: '12px', padding: '10px', background: '#eef2ff', borderRadius: '8px', fontSize: '13px' }}>
            <strong>Active Variant Rule:</strong> Attribute <code>Brand: Odoo</code> automatically adds{' '}
            <strong>+₹560.00</strong> surcharge per unit.
          </div>
          {discounts.map((d) => (
            <div
              key={d.code}
              style={{
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '8px',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <strong style={{ color: '#4f46e5' }}>{d.code}</strong> — {d.name}
              </div>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>
                {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `₹${d.value} OFF`} (Min Qty: {d.minQuantity})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
