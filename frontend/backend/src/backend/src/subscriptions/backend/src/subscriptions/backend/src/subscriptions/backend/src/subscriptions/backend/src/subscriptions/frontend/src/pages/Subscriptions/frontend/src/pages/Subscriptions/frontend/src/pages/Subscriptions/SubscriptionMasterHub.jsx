import React, { useState } from 'react';
import SubscriptionLifecycleConsole from './SubscriptionLifecycleConsole';
import CustomerSelfServicePortal from './CustomerSelfServicePortal';
import PlanAndPricingConfigurator from './PlanAndPricingConfigurator';
export default function SubscriptionMasterHub() {
  const [activeTab, setActiveTab] = useState('LIFECYCLE');

  const tabs = [
    { id: 'LIFECYCLE', label: 'Scene 3: Subscription Lifecycle & Quotations' },
    { id: 'PORTAL', label: 'Scene 5: Customer Self-Service Portal' },
    { id: 'CATALOG', label: 'Scenes 1 & 2: Plans, Variants & Discounts' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <header
        style={{
          background: '#1e1b4b',
          color: '#ffffff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '19px' }}>
            Brightloop Software — Subscription Lifecycle & Customer Portal Hub
          </h1>
          <span style={{ fontSize: '12px', color: '#c7d2fe' }}>
            Module 3 Owner: Alfiya S • Integrated with Billing & Finance Engine
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === t.id ? '#4f46e5' : 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main>
        {activeTab === 'LIFECYCLE' && <SubscriptionLifecycleConsole />}
        {activeTab === 'PORTAL' && <CustomerSelfServicePortal />}
        {activeTab === 'CATALOG' && <PlanAndPricingConfigurator />}
      </main>
    </div>
  );
}
