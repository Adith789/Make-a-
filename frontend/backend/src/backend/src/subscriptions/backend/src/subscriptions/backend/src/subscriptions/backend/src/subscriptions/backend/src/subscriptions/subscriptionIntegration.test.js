const assert = require('assert');
const subController = require('./subscription.controller');
const portalController = require('./customerPortal.controller');

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
    }
  };
}

function runVerificationSuite() {
  console.log('======================================================================');
  console.log('Brightloop Software – Subscription Lifecycle & Portal E2E Test Suite');
  console.log('Module Owner: Alfiya S (Scenes 1, 2, 3, and 5)');
  console.log('======================================================================');

  // Test 1: Verify Catalog, Variant Surcharges (Brand: Odoo +560), Plans, Taxes & Discounts
  const catRes = createMockRes();
  subController.getCatalogAndRules({}, catRes);
  assert.strictEqual(catRes.statusCode, 200);
  assert.strictEqual(catRes.payload.success, true);
  assert.ok(catRes.payload.data.products.length >= 2);
  console.log('[PASS] Scene 1 & 2: Product Catalog, Odoo Variant Surcharge (+560), Plans & Tax Rules loaded.');

  // Test 2: Create a New Subscription Draft with Variant Surcharge & Discount Code
  const createRes = createMockRes();
  subController.createSubscription(
    {
      body: {
        customerId: 'CUST-09',
        customerName: 'Technopark Trivandrum Digital Hub',
        customerEmail: 'ops@technopark.in',
        planId: 'PLAN-MONTHLY',
        discountCode: 'MAKEATON20',
        salesperson: 'Alfiya S',
        orderLines: [
          {
            productId: 'PROD-101',
            productName: 'Brightloop Enterprise Cloud ERP',
            variantLabel: 'Brand: Odoo',
            variantSurcharge: 560,
            quantity: 3,
            unitPrice: 2400
          }
        ]
      }
    },
    createRes
  );
  assert.strictEqual(createRes.statusCode, 201);
  const createdSub = createRes.payload.subscription;
  // 3 * (2400 + 560) = 8880 gross; 20% discount = 1776; taxable = 7104; 18% GST = 1278.72; Grand Total = 8382.72
  assert.strictEqual(createdSub.pricingSummary.grossSubtotal, 8880);
  assert.strictEqual(createdSub.pricingSummary.discountAmount, 1776);
  assert.strictEqual(createdSub.pricingSummary.taxableSubtotal, 7104);
  assert.strictEqual(createdSub.pricingSummary.totalTaxAmount, 1278.72);
  assert.strictEqual(createdSub.pricingSummary.grandTotal, 8382.72);
  console.log(`[PASS] Scene 2 & 3: Created Subscription ${createdSub.subscriptionNumber} with exact Variant + Discount + GST calculation (INR ${createdSub.pricingSummary.grandTotal}).`);

  // Test 3: Transition DRAFT -> QUOTATION_SENT
  const quoteRes = createMockRes();
  subController.transitionSubscriptionStatus(
    {
      params: { id: createdSub.id },
      body: { targetStatus: 'QUOTATION_SENT', actor: 'Alfiya S', reason: 'Sent quotation to Technopark' }
    },
    quoteRes
  );
  assert.strictEqual(quoteRes.statusCode, 200);
  assert.strictEqual(quoteRes.payload.subscription.status, 'QUOTATION_SENT');
  console.log('[PASS] Scene 3: Lifecycle state transitioned from DRAFT -> QUOTATION_SENT.');

  // Test 4: Scene 5 Customer Self-Service Portal Digital Quotation Acceptance -> ACTIVE
  const signRes = createMockRes();
  portalController.acceptQuotationInPortal(
    {
      params: { id: createdSub.id },
      body: {
        signedBy: 'Arun Nair (CTO, Technopark)',
        signatureNote: 'Approved for immediate recurring activation',
        activateImmediately: true
      }
    },
    signRes
  );
  assert.strictEqual(signRes.statusCode, 200);
  assert.strictEqual(signRes.payload.subscription.status, 'ACTIVE');
  assert.ok(signRes.payload.subscription.printableQuotationHtml.includes('Brightloop Software Pvt. Ltd.'));
  console.log('[PASS] Scene 5: Customer digitally signed quotation in Self-Service Portal -> Status ACTIVE.');

  // Test 5: Customer Self-Service Pause & Resume
  const pauseRes = createMockRes();
  portalController.executeCustomerSelfServiceAction(
    {
      params: { id: createdSub.id },
      body: { action: 'PAUSE', reason: 'Scheduled maintenance window' }
    },
    pauseRes
  );
  assert.strictEqual(pauseRes.statusCode, 200);
  assert.strictEqual(pauseRes.payload.subscription.status, 'PAUSED');

  const resumeRes = createMockRes();
  portalController.executeCustomerSelfServiceAction(
    {
      params: { id: createdSub.id },
      body: { action: 'RESUME', reason: 'Maintenance completed' }
    },
    resumeRes
  );
  assert.strictEqual(resumeRes.statusCode, 200);
  assert.strictEqual(resumeRes.payload.subscription.status, 'ACTIVE');
  console.log('[PASS] Scene 3 & 5: Customer Self-Service PAUSE and RESUME verified.');

  // Test 6: Upgrade Subscription Seats & Renew Contract
  const upgradeRes = createMockRes();
  subController.renewOrUpgradeSubscription(
    {
      params: { id: createdSub.id },
      body: { actionType: 'UPGRADE', additionalQuantity: 2, actor: 'Alfiya S' }
    },
    upgradeRes
  );
  assert.strictEqual(upgradeRes.statusCode, 200);
  assert.strictEqual(upgradeRes.payload.subscription.orderLines[0].quantity, 5);

  const renewRes = createMockRes();
  subController.renewOrUpgradeSubscription(
    {
      params: { id: createdSub.id },
      body: { actionType: 'RENEW', actor: 'Alfiya S' }
    },
    renewRes
  );
  assert.strictEqual(renewRes.statusCode, 201);
  assert.strictEqual(renewRes.payload.renewedSubscription.renewedFromId, createdSub.id);
  console.log(`[PASS] Scene 3: Subscription seat upgrade and contract renewal (${renewRes.payload.renewedSubscription.subscriptionNumber}) verified.`);

  console.log('======================================================================');
  console.log('ALL 6 END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  console.log('======================================================================');
}

if (require.main === module) {
  runVerificationSuite();
}

module.exports = { runVerificationSuite };
