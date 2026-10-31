const VALID_TRANSITIONS = {
  DRAFT: ['QUOTATION_SENT', 'CONFIRMED', 'CANCELLED'],
  QUOTATION_SENT: ['CONFIRMED', 'CANCELLED', 'DRAFT'],
  CONFIRMED: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['PAUSED', 'CLOSED', 'CANCELLED'],
  PAUSED: ['ACTIVE', 'CLOSED', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: ['DRAFT']
};

/**
 * Validates whether a subscription can transition to targetStatus under its Recurring Plan policy
 */
function validateTransition(subscription, targetStatus, plan) {
  if (!targetStatus) {
    return { allowed: false, reason: 'targetStatus is required.' };
  }
  const normalizedTarget = targetStatus.toUpperCase();
  const current = (subscription.status || 'DRAFT').toUpperCase();

  if (current === normalizedTarget) {
    return { allowed: false, reason: `Subscription is already in ${current} status.` };
  }

  const allowedTargets = VALID_TRANSITIONS[current] || [];
  if (!allowedTargets.includes(normalizedTarget)) {
    return {
      allowed: false,
      reason: `Invalid lifecycle transition from ${current} to ${normalizedTarget}. Allowed: [${allowedTargets.join(', ')}].`
    };
  }

  if (normalizedTarget === 'PAUSED' && plan && plan.isPausable === false) {
    return {
      allowed: false,
      reason: `Recurring Plan "${plan.name}" has Pausable disabled. Cannot pause subscription.`
    };
  }

  return { allowed: true };
}

/**
 * Computes next expiration date based on billingPeriod
 */
function computeNextExpirationDate(startDateStr, billingPeriod) {
  const date = new Date(startDateStr || Date.now());
  if (billingPeriod === 'DAILY') {
    date.setDate(date.getDate() + 30);
  } else if (billingPeriod === 'WEEKLY') {
    date.setDate(date.getDate() + 84);
  } else if (billingPeriod === 'YEARLY') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Creates a linked renewal subscription record when an active contract is renewed
 */
function buildRenewalSubscriptionClone(existingSub, nextSeqNumber) {
  const newStart = existingSub.expirationDate || new Date().toISOString().slice(0, 10);
  const newExp = computeNextExpirationDate(newStart, existingSub.billingPeriod);

  return {
    id: `SUB-2026-00${nextSeqNumber}`,
    subscriptionNumber: `BL-SUB-000${nextSeqNumber}`,
    renewedFromId: existingSub.id,
    customerId: existingSub.customerId,
    customerName: existingSub.customerName,
    customerEmail: existingSub.customerEmail,
    planId: existingSub.planId,
    billingPeriod: existingSub.billingPeriod,
    status: 'ACTIVE',
    startDate: newStart,
    expirationDate: newExp,
    nextBillingDate: newStart,
    paymentTerms: existingSub.paymentTerms,
    salesperson: existingSub.salesperson || 'Alfiya S',
    discountCode: existingSub.discountCode,
    orderLines: existingSub.orderLines.map((line, i) => ({
      ...line,
      lineId: `LINE-REN-${Date.now()}-${i + 1}`
    })),
    pricingSummary: null,
    historyLog: [
      {
        timestamp: new Date().toISOString(),
        from: 'ACTIVE',
        to: 'ACTIVE',
        actor: 'Renewal Automation Engine (Alfiya S)',
        note: `Cloned and renewed from ${existingSub.subscriptionNumber}`
      }
    ]
  };
}

/**
 * Evaluates subscription health & churn risk score for proactive retention
 */
function evaluateChurnRisk(subscription) {
  let riskScore = 15;
  const reasons = [];

  if (subscription.status === 'PAUSED') {
    riskScore += 45;
    reasons.push('Subscription is currently paused');
  } else if (subscription.status === 'QUOTATION_SENT') {
    riskScore += 25;
    reasons.push('Quotation awaiting customer confirmation');
  }

  const totalSeats = (subscription.orderLines || []).reduce((sum, l) => sum + Number(l.quantity || 0), 0);
  if (totalSeats <= 1) {
    riskScore += 15;
    reasons.push('Single-seat deployment');
  }

  const band = riskScore >= 55 ? 'HIGH_RISK' : riskScore >= 35 ? 'MODERATE_RISK' : 'HEALTHY';
  return {
    riskScore,
    band,
    reasons: reasons.length ? reasons : ['Active multi-seat recurring utilization']
  };
}

module.exports = {
  VALID_TRANSITIONS,
  validateTransition,
  computeNextExpirationDate,
  buildRenewalSubscriptionClone,
  evaluateChurnRisk
};
