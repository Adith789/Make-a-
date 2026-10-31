const subController = require('./subscription.controller');
const lifecycleService = require('./lifecycleAutomation.service');
const quotationDocService = require('./quotationDocument.service');
exports.getCustomerPortalOverview = (req, res) => {
  const { customerId } = req.params;
  const store = subController._internalStore;

  const customerSubs = store.subscriptions.filter(
    (s) => s.customerId === customerId || s.customerEmail.toLowerCase() === (customerId || '').toLowerCase()
  );

  const enrichedSubs = customerSubs.map((sub) => {
    const plan = store.plans.find((p) => p.id === sub.planId) || store.plans[0];
    const pricingSummary = subController._calculateSubscriptionPricing(sub);
    return {
      ...sub,
      pricingSummary,
      selfServicePermissions: {
        canAcceptQuotation: sub.status === 'QUOTATION_SENT' || sub.status === 'DRAFT',
        canPause: sub.status === 'ACTIVE' && plan.isPausable,
        canResume: sub.status === 'PAUSED',
        canClose: (sub.status === 'ACTIVE' || sub.status === 'PAUSED') && plan.isClosableByCustomer,
        canRenew: sub.status === 'ACTIVE' && plan.isRenewable
      }
    };
  });

  const totalMonthlySpend = enrichedSubs
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (s.pricingSummary ? s.pricingSummary.normalizedMRR : 0), 0);

  return res.status(200).json({
    success: true,
    moduleOwner: 'Alfiya S',
    customerId,
    activeSubscriptionCount: enrichedSubs.filter((s) => s.status === 'ACTIVE').length,
    normalizedMonthlySpend: Number(totalMonthlySpend.toFixed(2)),
    subscriptions: enrichedSubs
  });
};

/**
 * Scene 5: Customer digitally signs and accepts a quotation in the portal,
 * automatically transitioning QUOTATION_SENT -> CONFIRMED -> ACTIVE
 */
exports.acceptQuotationInPortal = (req, res) => {
  const { id } = req.params;
  const { signedBy, signatureNote, activateImmediately } = req.body || {};
  const store = subController._internalStore;

  const sub = store.subscriptions.find((s) => s.id === id || s.subscriptionNumber === id);
  if (!sub) {
    return res.status(404).json({ success: false, message: `Subscription quotation ${id} not found.` });
  }

  if (!['DRAFT', 'QUOTATION_SENT', 'CONFIRMED'].includes(sub.status)) {
    return res.status(400).json({
      success: false,
      message: `Quotation in status ${sub.status} cannot be signed again.`
    });
  }

  const signer = signedBy || sub.customerName;
  const nowIso = new Date().toISOString();

  sub.status = activateImmediately !== false ? 'ACTIVE' : 'CONFIRMED';
  sub.digitalSignature = {
    signedBy: signer,
    signedAt: nowIso,
    signatureNote: signatureNote || 'Accepted via Brightloop Customer Self-Service Portal'
  };

  sub.historyLog.push({
    timestamp: nowIso,
    from: 'QUOTATION_SENT',
    to: sub.status,
    actor: `Customer Portal (${signer})`,
    note: `Digitally signed quotation and activated recurring schedule`
  });

  sub.pricingSummary = subController._calculateSubscriptionPricing(sub);
  sub.printableQuotationHtml = quotationDocService.generateQuotationHtml(sub);

  return res.status(200).json({
    success: true,
    message: `Quotation ${sub.subscriptionNumber} digitally signed by ${signer} and set to ${sub.status}.`,
    subscription: sub
  });
};

/**
 * Scene 5: Customer Self-Service Action (PAUSE, RESUME, CLOSE)
 */
exports.executeCustomerSelfServiceAction = (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body || {};
  const store = subController._internalStore;

  const sub = store.subscriptions.find((s) => s.id === id || s.subscriptionNumber === id);
  if (!sub) {
    return res.status(404).json({ success: false, message: `Subscription ${id} not found.` });
  }

  const plan = store.plans.find((p) => p.id === sub.planId) || store.plans[0];
  const normalizedAction = (action || '').toUpperCase();

  let targetStatus = null;
  if (normalizedAction === 'PAUSE') {
    if (!plan.isPausable) {
      return res.status(403).json({ success: false, message: `Plan "${plan.name}" does not allow customer pausing.` });
    }
    targetStatus = 'PAUSED';
  } else if (normalizedAction === 'RESUME') {
    targetStatus = 'ACTIVE';
  } else if (normalizedAction === 'CLOSE') {
    if (!plan.isClosableByCustomer) {
      return res.status(403).json({
        success: false,
        message: `Enterprise Plan "${plan.name}" requires account manager approval to close.`
      });
    }
    targetStatus = 'CLOSED';
  } else {
    return res.status(400).json({ success: false, message: 'Invalid self-service action. Expected PAUSE, RESUME, or CLOSE.' });
  }

  const check = lifecycleService.validateTransition(sub, targetStatus, plan);
  if (!check.allowed) {
    return res.status(400).json({ success: false, message: check.reason });
  }

  const prev = sub.status;
  sub.status = targetStatus;
  sub.historyLog.push({
    timestamp: new Date().toISOString(),
    from: prev,
    to: targetStatus,
    actor: `Customer Portal (${sub.customerName})`,
    note: reason || `Customer executed ${normalizedAction} via Self-Service Portal`
  });

  return res.status(200).json({
    success: true,
    message: `Customer self-service action ${normalizedAction} completed (${prev} -> ${targetStatus}).`,
    subscription: sub
  });
};
