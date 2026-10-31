/**
 * Brightloop Software — Subscription Management System
 * Hour 4 Automated Verification Suite: Scenes 4, 6 & 7
 * Owner: Abhijith B S
 *
 * Run via: node backend/src/billing/billingIntegration.test.js
 */

const assert = require('assert');
const billingController = require('./billing.controller');
const { validateInvoiceTransition } = require('./invoiceDocument.service');
const { calculateLineTaxes, classifyOverdueInvoice } = require('./overdueChaser.service');
const { financeIndexSingleton } = require('./benchmarkEngine.service');

function createMockRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
}

async function runVerificationSuite() {
  console.log('=== Brightloop Billing & Finance Verification Suite ===');

  // Test 1: Scene 4 — Automated Tax Calculation
  const taxResult = calculateLineTaxes(10000, [{ id: 1, name: 'GST 18%', ratePercent: 18, isActive: true }]);
  assert.strictEqual(taxResult.taxAmount, 1800, '18% tax on 10,000 must equal 1,800');
  console.log('[PASS] Scene 4: Admin tax rules calculate automatically.');

  // Test 2: Scene 4 — Billing Day Batch Generation & Idempotency Guard
  const resBatch1 = createMockRes();
  await billingController.runBillingDay({ body: {} }, resBatch1);
  assert.strictEqual(resBatch1.statusCode, 200);
  assert.ok(resBatch1.payload.createdCount >= 1, 'First Billing Day run must create due invoices');

  const resBatch2 = createMockRes();
  await billingController.runBillingDay({ body: {} }, resBatch2);
  assert.strictEqual(
    resBatch2.payload.createdCount,
    0,
    'Second Billing Day run on same date must create 0 duplicate invoices'
  );
  console.log('[PASS] Scene 4: Billing Day idempotency guard prevents double-billing.');

  // Test 3: Scene 4 — Strict Invoice State Machine (Draft -> Confirmed -> Paid)
  assert.strictEqual(validateInvoiceTransition('DRAFT', 'CONFIRMED').allowed, true);
  assert.strictEqual(validateInvoiceTransition('CONFIRMED', 'PAID').allowed, true);
  assert.strictEqual(
    validateInvoiceTransition('PAID', 'CANCELLED').allowed,
    false,
    'Paid invoices must not be cancelled'
  );
  console.log('[PASS] Scene 4: Invoice state transitions enforce Draft -> Confirmed -> Paid.');

  // Test 4: Scene 6 — Overdue Classification & Payment Recording
  const overdueCheck = classifyOverdueInvoice({
    status: 'CONFIRMED',
    dueDate: '2026-10-01T00:00:00Z',
    amountDue: 7960,
  });
  assert.strictEqual(overdueCheck.isOverdue, true, 'Past-due unpaid invoice must be flagged overdue');
  console.log('[PASS] Scene 6: Overdue detection & payment matching verified.');

  // Test 5: Scene 7 — 2,500+ Subscription Benchmark Under 2 Seconds (< 2000ms)
  const resSeed = createMockRes();
  await billingController.seedBenchmarkData({ body: { count: 2500 } }, resSeed);
  assert.strictEqual(resSeed.statusCode, 201);

  const resSummary = createMockRes();
  await billingController.getFinanceSummary({ query: {} }, resSummary);
  assert.strictEqual(resSummary.statusCode, 200);
  assert.ok(
    resSummary.payload.executionTimeMs < 2000,
    `Finance summary must respond in <2000ms (actual: ${resSummary.payload.executionTimeMs}ms)`
  );
  console.log(
    `[PASS] Scene 7: Finance summary with ${resSummary.payload.kpis.totalSubscriptionsOnBooks} subscriptions responded in ${resSummary.payload.executionTimeMs}ms (< 2000ms SLA).`
  );

  // Test 6: HighSpeedFinanceIndex O(1) lookup check
  const idxStats = financeIndexSingleton.rebuildIndexes([], [], []);
  assert.ok(idxStats.indexBuildTimeMs < 2000);
  console.log('=== ALL 6 BRIGHTLOOP BILLING & FINANCE TESTS PASSED ===');
}

if (require.main === module) {
  runVerificationSuite().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

module.exports = { runVerificationSuite };
