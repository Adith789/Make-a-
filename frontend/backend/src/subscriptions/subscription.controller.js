const lifecycleService = require('./lifecycleAutomation.service');
const quotationDocService = require('./quotationDocument.service');
const store = {
  products: [
    {
      id: 'PROD-101',
      name: 'Brightloop Enterprise Cloud ERP',
      type: 'SERVICE',
      baseSalesPrice: 2400,
      costPrice: 600,
      category: 'Enterprise SaaS',
      variants: [
        { attribute: 'Brand', value: 'Odoo', surcharge: 560 },
        { attribute: 'Brand', value: 'Brightloop Native', surcharge: 0 },
        { attribute: 'Support Tier', value: '24x7 Dedicated SLA', surcharge: 450 }
      ]
    },
    {
      id: 'PROD-102',
      name: 'Brightloop AI Analytics & Forecasting Add-on',
      type: 'SERVICE',
      baseSalesPrice: 1200,
      costPrice: 300,
      category: 'Analytics',
      variants: [
        { attribute: 'Brand', value: 'Odoo', surcharge: 560 },
        { attribute: 'Compute Node', value: 'GPU Accelerated', surcharge: 800 }
      ]
    }
  ],
  plans: [
    {
      id: 'PLAN-MONTHLY',
      name: 'Standard Monthly Plan',
      billingPeriod: 'MONTHLY',
      intervalCount: 1,
      basePrice: 2400,
      minQuantity: 1,
      autoCloseDays: 45,
      isPausable: true,
      isClosableByCustomer: true,
      isRenewable: true
    },
    {
      id: 'PLAN-YEARLY',
      name: 'Enterprise Annual Plan (15% Base Savings)',
      billingPeriod: 'YEARLY',
      intervalCount: 1,
      basePrice: 24480,
      minQuantity: 5,
      autoCloseDays: 60,
      isPausable: true,
      isClosableByCustomer: false,
      isRenewable: true
    },
    {
      id: 'PLAN-WEEKLY',
      name: 'Agile Weekly Sprint Plan',
      billingPeriod: 'WEEKLY',
      intervalCount: 1,
      basePrice: 650,
      minQuantity: 1,
      autoCloseDays: 14,
      isPausable: false,
      isClosableByCustomer: true,
      isRenewable: true
    }
  ],
  discounts: [
    {
      code: 'MAKEATON20',
      name: 'Make-A-Ton Launch 20% Off',
      type: 'PERCENTAGE',
      value: 20,
      minQuantity: 1,
      validFrom: '2026-01-01',
      validUntil: '2026-12-31',
      maxUsageLimit: 100,
      usedCount: 12,
      appliesTo: 'FIRST_INVOICE_AND_RECURRING'
    },
    {
      code: 'FLAT500',
      name: 'Enterprise Onboarding Flat 500 Credit',
      type: 'FIXED',
      value: 500,
      minQuantity: 2,
      validFrom: '2026-01-01',
      validUntil: '2026-12-31',
      maxUsageLimit: 50,
      usedCount: 5,
      appliesTo: 'FIRST_INVOICE_ONLY'
    }
  ],
  taxRules: [
    { id: 'TAX-GST18', name: 'GST 18% (CGST 9% + SGST 9%)', ratePercent: 18, isActive: true },
    { id: 'TAX-CESS2', name: 'Digital Infrastructure Cess 2%', ratePercent: 2, isActive: false }
  ],
  subscriptions: [
    {
      id: 'SUB-2026-001',
      subscriptionNumber: 'BL-SUB-0001',
      customerId: 'CUST-01',
      customerName: 'Kochi Metro Logistics Pvt Ltd',
      customerEmail: 'finance@kochimetrologistics.in',
      planId: 'PLAN-MONTHLY',
      billingPeriod: 'MONTHLY',
      status: 'ACTIVE',
      startDate: '2026-10-01',
      expirationDate: '2027-10-01',
      nextBillingDate: '2026-11-01',
      paymentTerms: 'NET_15',
      salesperson: 'Alfiya S',
      discountCode: 'MAKEATON20',
      orderLines: [
        {
          lineId: 'LINE-1',
          productId: 'PROD-101',
          productName: 'Brightloop Enterprise Cloud ERP',
          variantLabel: 'Brand: Odoo',
          variantSurcharge: 560,
          quantity: 5,
          unitPrice: 2400
        }
      ],
      pricingSummary: null,
      historyLog: [
        { timestamp: '2026-10-01T09:00:00Z', from: null, to: 'DRAFT', actor: 'Alfiya S', note: 'Initial subscription draft created' },
        { timestamp: '2026-10-01T09:15:00Z', from: 'DRAFT', to: 'QUOTATION_SENT', actor: 'Alfiya S', note: 'Quotation sent to customer' },
        { timestamp: '2026-10-01T10:00:00Z', from: 'QUOTATION_SENT', to: 'CONFIRMED', actor: 'Customer Portal', note: 'Quotation signed online' },
        { timestamp: '2026-10-01T10:05:00Z', from: 'CONFIRMED', to: 'ACTIVE', actor: 'System', note: 'Recurring billing activated' }
      ]
    },
    {
      id: 'SUB-2026-002',
      subscriptionNumber: 'BL-SUB-0002',
      customerId: 'CUST-02',
      customerName: 'Malabar Spice Exports Ltd',
      customerEmail: 'accounts@malabarspice.com',
      planId: 'PLAN-YEARLY',
      billingPeriod: 'YEARLY',
      status: 'QUOTATION_SENT',
      startDate: '2026-10-25',
      expirationDate: '2027-10-25',
      nextBillingDate: '2026-10-25',
      paymentTerms: 'IMMEDIATE',
      salesperson: 'Alfiya S',
      discountCode: 'FLAT500',
      orderLines: [
        {
          lineId: 'LINE-2',
          productId: 'PROD-102',
          productName: 'Brightloop AI Analytics & Forecasting Add-on',
          variantLabel: 'Brand: Odoo',
          variantSurcharge: 560,
          quantity: 6,
          unitPrice: 1200
        }
      ],
      pricingSummary: null,
      historyLog: [
        { timestamp: '2026-10-25T11:00:00Z', from: null, to: 'DRAFT', actor: 'Alfiya S', note: 'Created annual analytics quotation' },
        { timestamp: '2026-10-25T11:30:00Z', from: 'DRAFT', to: 'QUOTATION_SENT', actor: 'Alfiya S', note: 'Dispatched quotation PDF to customer' }
      ]
    }
  ]
};
function calculateSubscriptionPricing(subscription) {
  const plan = store.plans.find((p) => p.id === subscription.planId) || store.plans[0];
  const discountObj = subscription.discountCode
    ? store.discounts.find((d) => d.code.toUpperCase() === subscription.discountCode.toUpperCase())
    : null;

  let grossSubtotal = 0;
  let totalQuantity = 0;

  const computedLines = (subscription.orderLines || []).map((line) => {
    const qty = Number(line.quantity || 1);
    const baseUnit = Number(line.unitPrice || 0);
    const surcharge = Number(line.variantSurcharge || 0);
    const effectiveUnitPrice = baseUnit + surcharge;
    const lineSubtotal = Number((qty * effectiveUnitPrice).toFixed(2));

    grossSubtotal += lineSubtotal;
    totalQuantity += qty;

    return {
      ...line,
      effectiveUnitPrice,
      lineSubtotal
    };
  });

  // Evaluate Discount Eligibility
  let discountAmount = 0;
  let appliedDiscountInfo = null;
  if (discountObj && totalQuantity >= (discountObj.minQuantity || 1) && discountObj.usedCount < discountObj.maxUsageLimit) {
    if (discountObj.type === 'PERCENTAGE') {
      discountAmount = Number(((grossSubtotal * discountObj.value) / 100).toFixed(2));
    } else if (discountObj.type === 'FIXED') {
      discountAmount = Math.min(grossSubtotal, Number(discountObj.value));
    }
    appliedDiscountInfo = {
      code: discountObj.code,
      name: discountObj.name,
      type: discountObj.type,
      value: discountObj.value,
      discountAmount
    };
  }

  const taxableSubtotal = Number(Math.max(0, grossSubtotal - discountAmount).toFixed(2));

  // Evaluate Active Tax Rules
  const activeTaxes = store.taxRules.filter((t) => t.isActive);
  let totalTaxAmount = 0;
  const taxBreakdown = activeTaxes.map((tax) => {
    const amount = Number(((taxableSubtotal * tax.ratePercent) / 100).toFixed(2));
    totalTaxAmount += amount;
    return {
      taxId: tax.id,
      name: tax.name,
      ratePercent: tax.ratePercent,
      amount
    };
  });

  const grandTotal = Number((taxableSubtotal + totalTaxAmount).toFixed(2));

  // Normalize MRR & ARR across billing periods
  const periodMultipliersToMonthly = {
    DAILY: 30,
    WEEKLY: 4.3333,
    MONTHLY: 1,
    YEARLY: 1 / 12
  };
  const billingPeriod = subscription.billingPeriod || plan.billingPeriod || 'MONTHLY';
  const multiplier = periodMultipliersToMonthly[billingPeriod] || 1;
  const normalizedMRR = Number((taxableSubtotal * multiplier).toFixed(2));
  const normalizedARR = Number((normalizedMRR * 12).toFixed(2));

  return {
    grossSubtotal: Number(grossSubtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    appliedDiscount: appliedDiscountInfo,
    taxableSubtotal,
    totalTaxAmount: Number(totalTaxAmount.toFixed(2)),
    taxBreakdown,
    grandTotal,
    normalizedMRR,
    normalizedARR,
    computedLines
  };
}
store.subscriptions.forEach((sub) => {
  sub.pricingSummary = calculateSubscriptionPricing(sub);
});
exports.getCatalogAndRules = (req, res) => {
  return res.status(200).json({
    success: true,
    moduleOwner: 'Alfiya S',
    data: {
      products: store.products,
      plans: store.plans,
      discounts: store.discounts,
      taxRules: store.taxRules
    }
  });
};

exports.createProductOrPlan = (req, res) => {
  const { entityType, payload } = req.body || {};
  if (entityType === 'PRODUCT') {
    const newProduct = {
      id: payload.id || `PROD-${Date.now().toString().slice(-4)}`,
      name: payload.name || 'New Subscription Service',
      type: payload.type || 'SERVICE',
      baseSalesPrice: Number(payload.baseSalesPrice || 1000),
      costPrice: Number(payload.costPrice || 250),
      category: payload.category || 'SaaS',
      variants: Array.isArray(payload.variants) ? payload.variants : [{ attribute: 'Brand', value: 'Odoo', surcharge: 560 }]
    };
    store.products.push(newProduct);
    return res.status(201).json({ success: true, item: newProduct });
  }

  if (entityType === 'PLAN') {
    const newPlan = {
      id: payload.id || `PLAN-${Date.now().toString().slice(-4)}`,
      name: payload.name || 'Custom Recurring Plan',
      billingPeriod: payload.billingPeriod || 'MONTHLY',
      intervalCount: Number(payload.intervalCount || 1),
      basePrice: Number(payload.basePrice || 1500),
      minQuantity: Number(payload.minQuantity || 1),
      autoCloseDays: Number(payload.autoCloseDays || 30),
      isPausable: payload.isPausable !== false,
      isClosableByCustomer: payload.isClosableByCustomer !== false,
      isRenewable: payload.isRenewable !== false
    };
    store.plans.push(newPlan);
    return res.status(201).json({ success: true, item: newPlan });
  }

  return res.status(400).json({ success: false, message: 'Invalid entityType. Expected PRODUCT or PLAN.' });
};

exports.getSubscriptions = (req, res) => {
  const { status, customerId, billingPeriod } = req.query || {};
  let results = [...store.subscriptions];

  if (status) {
    results = results.filter((s) => s.status.toUpperCase() === status.toUpperCase());
  }
  if (customerId) {
    results = results.filter((s) => s.customerId === customerId);
  }
  if (billingPeriod) {
    results = results.filter((s) => s.billingPeriod.toUpperCase() === billingPeriod.toUpperCase());
  }

  results.forEach((sub) => {
    sub.pricingSummary = calculateSubscriptionPricing(sub);
    sub.churnHealth = lifecycleService.evaluateChurnRisk(sub);
  });

  return res.status(200).json({
    success: true,
    count: results.length,
    subscriptions: results
  });
};

exports.getSubscriptionById = (req, res) => {
  const sub = store.subscriptions.find((s) => s.id === req.params.id || s.subscriptionNumber === req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, message: `Subscription ${req.params.id} not found.` });
  }
  sub.pricingSummary = calculateSubscriptionPricing(sub);
  sub.churnHealth = lifecycleService.evaluateChurnRisk(sub);
  sub.printableQuotationHtml = quotationDocService.generateQuotationHtml(sub);

  return res.status(200).json({
    success: true,
    subscription: sub
  });
};

exports.createSubscription = (req, res) => {
  const body = req.body || {};
  const plan = store.plans.find((p) => p.id === body.planId) || store.plans[0];

  if (!body.customerName || !Array.isArray(body.orderLines) || body.orderLines.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'customerName and at least one orderLine are required to create a subscription.'
    });
  }

  // Enforce Plan Minimum Quantity
  const totalQty = body.orderLines.reduce((acc, l) => acc + Number(l.quantity || 1), 0);
  if (totalQty < (plan.minQuantity || 1)) {
    return res.status(400).json({
      success: false,
      message: `Plan "${plan.name}" requires a minimum total quantity of ${plan.minQuantity} units (received ${totalQty}).`
    });
  }

  const nextIndex = store.subscriptions.length + 1;
  const subId = body.id || `SUB-2026-00${nextIndex}`;
  const subNum = `BL-SUB-000${nextIndex}`;
  const startDate = body.startDate || new Date().toISOString().slice(0, 10);

  const newSub = {
    id: subId,
    subscriptionNumber: subNum,
    customerId: body.customerId || `CUST-0${nextIndex}`,
    customerName: body.customerName,
    customerEmail: body.customerEmail || 'customer@example.com',
    planId: plan.id,
    billingPeriod: plan.billingPeriod,
    status: 'DRAFT',
    startDate,
    expirationDate: body.expirationDate || lifecycleService.computeNextExpirationDate(startDate, plan.billingPeriod),
    nextBillingDate: startDate,
    paymentTerms: body.paymentTerms || 'IMMEDIATE',
    salesperson: body.salesperson || 'Alfiya S',
    discountCode: body.discountCode || null,
    orderLines: body.orderLines.map((line, idx) => ({
      lineId: `LINE-${Date.now()}-${idx + 1}`,
      productId: line.productId || 'PROD-101',
      productName: line.productName || 'Brightloop Enterprise Cloud ERP',
      variantLabel: line.variantLabel || 'Brand: Odoo',
      variantSurcharge: line.variantSurcharge !== undefined ? Number(line.variantSurcharge) : 560,
      quantity: Number(line.quantity || 1),
      unitPrice: Number(line.unitPrice || plan.basePrice)
    })),
    pricingSummary: null,
    historyLog: [
      {
        timestamp: new Date().toISOString(),
        from: null,
        to: 'DRAFT',
        actor: body.salesperson || 'Alfiya S',
        note: 'Created new subscription draft'
      }
    ]
  };

  newSub.pricingSummary = calculateSubscriptionPricing(newSub);
  store.subscriptions.push(newSub);

  return res.status(201).json({
    success: true,
    message: 'Subscription draft created with recurring plan and variant pricing.',
    subscription: newSub
  });
};

exports.transitionSubscriptionStatus = (req, res) => {
  const { id } = req.params;
  const { targetStatus, actor, reason } = req.body || {};

  const sub = store.subscriptions.find((s) => s.id === id || s.subscriptionNumber === id);
  if (!sub) {
    return res.status(404).json({ success: false, message: `Subscription ${id} not found.` });
  }

  const plan = store.plans.find((p) => p.id === sub.planId) || store.plans[0];
  const validation = lifecycleService.validateTransition(sub, targetStatus, plan);

  if (!validation.allowed) {
    return res.status(400).json({
      success: false,
      currentStatus: sub.status,
      requestedStatus: targetStatus,
      message: validation.reason
    });
  }

  const previousStatus = sub.status;
  sub.status = targetStatus.toUpperCase();
  sub.historyLog.push({
    timestamp: new Date().toISOString(),
    from: previousStatus,
    to: sub.status,
    actor: actor || 'Alfiya S',
    note: reason || `Transitioned from ${previousStatus} to ${sub.status}`
  });

  sub.pricingSummary = calculateSubscriptionPricing(sub);

  return res.status(200).json({
    success: true,
    message: `Subscription ${sub.subscriptionNumber} moved from ${previousStatus} to ${sub.status}.`,
    subscription: sub
  });
};

exports.renewOrUpgradeSubscription = (req, res) => {
  const { id } = req.params;
  const { actionType, newPlanId, additionalQuantity, variantLabel, variantSurcharge, actor } = req.body || {};

  const sub = store.subscriptions.find((s) => s.id === id || s.subscriptionNumber === id);
  if (!sub) {
    return res.status(404).json({ success: false, message: `Subscription ${id} not found.` });
  }

  const plan = store.plans.find((p) => p.id === sub.planId) || store.plans[0];

  if (actionType === 'RENEW') {
    if (!plan.isRenewable) {
      return res.status(400).json({ success: false, message: `Plan "${plan.name}" does not permit renewals.` });
    }
    const renewedClone = lifecycleService.buildRenewalSubscriptionClone(sub, store.subscriptions.length + 1);
    renewedClone.pricingSummary = calculateSubscriptionPricing(renewedClone);
    store.subscriptions.push(renewedClone);

    return res.status(201).json({
      success: true,
      message: `Renewal subscription ${renewedClone.subscriptionNumber} generated from ${sub.subscriptionNumber}.`,
      originalSubscriptionId: sub.id,
      renewedSubscription: renewedClone
    });
  }

  if (actionType === 'UPGRADE') {
    if (newPlanId) {
      const targetPlan = store.plans.find((p) => p.id === newPlanId);
      if (targetPlan) {
        sub.planId = targetPlan.id;
        sub.billingPeriod = targetPlan.billingPeriod;
      }
    }
    if (additionalQuantity && sub.orderLines.length > 0) {
      sub.orderLines[0].quantity += Number(additionalQuantity);
    }
    if (variantLabel && sub.orderLines.length > 0) {
      sub.orderLines[0].variantLabel = variantLabel;
      if (variantSurcharge !== undefined) {
        sub.orderLines[0].variantSurcharge = Number(variantSurcharge);
      }
    }

    sub.pricingSummary = calculateSubscriptionPricing(sub);
    sub.historyLog.push({
      timestamp: new Date().toISOString(),
      from: sub.status,
      to: sub.status,
      actor: actor || 'Customer Self-Service',
      note: `Subscription upgraded (Plan: ${sub.planId}, Total MRR: ${sub.pricingSummary.normalizedMRR})`
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${sub.subscriptionNumber} upgraded and recalculated.`,
      subscription: sub
    });
  }

  return res.status(400).json({ success: false, message: 'Unsupported actionType. Use RENEW or UPGRADE.' });
};

exports._internalStore = store;
exports._calculateSubscriptionPricing = calculateSubscriptionPricing;
