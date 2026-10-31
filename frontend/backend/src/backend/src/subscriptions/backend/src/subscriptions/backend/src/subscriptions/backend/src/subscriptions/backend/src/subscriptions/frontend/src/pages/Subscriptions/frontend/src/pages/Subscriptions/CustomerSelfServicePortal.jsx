

import React, { useState } from 'react'
export default function CustomerSelfServicePortal() {
  const [customerSubs, setCustomerSubs] = useState([
    {
      id: 'SUB-2026-001',
      subscriptionNumber: 'BL-SUB-0001',
      productName: 'Brightloop Enterprise Cloud ERP (Brand: Odoo +₹560)',
      planName: 'Standard Monthly Plan',
      status: 'ACTIVE',
      seats: 5,
      nextBillingDate: '2026-11-01',
      recurringTotal: 13971.2,
      isPausable: true,
      isClosable: true,
      signedBy: 'Signed Online by Kochi Metro Logistics'
    },
    {
      id: 'SUB-2026-002',
      subscriptionNumber: 'BL-SUB-0002',
      productName: 'Brightloop AI Analytics & Forecasting Add-on (Brand: Odoo +₹560)',
      planName: 'Enterprise Annual Plan',
      status: 'QUOTATION_SENT',
      seats: 6,
      nextBillingDate: '2026-10-31',
      recurringTotal: 11866.08,
      isPausable: true,
      isClosable: false,
      signedBy: null
    }
  ]);

  const [signerName, setSignerName] = useState('Alfiya S (Authorized Signatory)');
  const [bannerMessage, setBannerMessage] = useState('');

  const handleAcceptQuotation = (id) => {
    setCustomerSubs((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'ACTIVE',
              signedBy: `${signerName} on ${new Date().toLocaleDateString()}`
            }
          : s
      )
    );
    setBannerMessage(`Quotation ${id} digitally signed and activated for recurring billing!`);
  };

  const handleSelfServiceToggle = (id, nextStatus, label) => {
    setCustomerSubs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
    setBannerMessage(`Subscription ${id} status updated to ${nextStatus} (${label}).`);
  };

  const handleSeatUpgrade = (id) => {
    setCustomerSubs((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              seats: s.seats + 2,
              recurringTotal: Number((s.recurringTotal * ((s.seats + 2) / s.seats)).toFixed(2))
            }
          : s
      )
    );
    setBannerMessage(`Added +2 seats to ${id} with instant prorated recurring calculation.`);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#0f172a', background: '#f8fafc' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#1e1b4b' }}>
          Scene 5: Customer Self-Service & Quotation Portal
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>
          Module Owner: Alfiya S • Online Quotation Digital Signature, Seat Upgrades & Self-Service Pause/Resume
        </p>
      </div>

      {bannerMessage && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          ✓ {bannerMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
        {customerSubs.map((sub) => (
          <div
            key={sub.id}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '15px' }}>{sub.subscriptionNumber}</span>
              <span
                style={{
                  background: sub.status === 'ACTIVE' ? '#dcfce7' : sub.status === 'PAUSED' ? '#ffedd5' : '#fef3c7',
                  color: sub.status === 'ACTIVE' ? '#15803d' : sub.status === 'PAUSED' ? '#c2410c' : '#b45309',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                {sub.status}
              </span>
            </div>

            <h3 style={{ margin: '10px 0 6px', fontSize: '16px' }}>{sub.productName}</h3>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
              Plan: <strong>{sub.planName}</strong> • Seats: <strong>{sub.seats}</strong> • Next Billing:{' '}
              <strong>{sub.nextBillingDate}</strong>
            </p>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
              <div>
                Recurring Total (incl. Variant + GST):{' '}
                <strong style={{ color: '#4f46e5', fontSize: '15px' }}>
                  ₹{sub.recurringTotal.toLocaleString('en-IN')}
                </strong>
              </div>
              {sub.signedBy && (
                <div style={{ marginTop: '4px', color: '#16a34a', fontSize: '12px' }}>
                  ✓ {sub.signedBy}
                </div>
              )}
            </div>

            {sub.status === 'QUOTATION_SENT' && (
              <div style={{ marginBottom: '12px', padding: '10px', background: '#fffbeb', borderRadius: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Digital Signer Name:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <button
                    onClick={() => handleAcceptQuotation(sub.id)}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Sign & Activate
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleSeatUpgrade(sub.id)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #4f46e5',
                  background: '#eef2ff',
                  color: '#4f46e5',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Upgrade (+2 Seats)
              </button>

              {sub.status === 'ACTIVE' && sub.isPausable && (
                <button
                  onClick={() => handleSelfServiceToggle(sub.id, 'PAUSED', 'Paused by Customer')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ea580c',
                    background: '#fff7ed',
                    color: '#ea580c',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Pause Plan
                </button>
              )}

              {sub.status === 'PAUSED' && (
                <button
                  onClick={() => handleSelfServiceToggle(sub.id, 'ACTIVE', 'Resumed by Customer')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid #16a34a',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Resume Plan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
