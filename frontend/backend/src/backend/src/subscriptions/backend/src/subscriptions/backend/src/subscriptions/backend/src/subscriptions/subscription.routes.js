
const express = require('express');
const router = express.Router();
const subscriptionController = require('./subscription.controller');
const customerPortalController = require('./customerPortal.controller');

// Scenes 1 & 2: Products, Variants (Brand: Odoo +560), Recurring Plans, Discounts & Tax Rules
router.get('/catalog', subscriptionController.getCatalogAndRules);
router.post('/catalog', subscriptionController.createProductOrPlan);

// Scene 3: Subscription Creation, Listing, Quotation HTML View & Lifecycle State Machine
router.get('/', subscriptionController.getSubscriptions);
router.post('/', subscriptionController.createSubscription);
router.get('/:id', subscriptionController.getSubscriptionById);
router.patch('/:id/status', subscriptionController.transitionSubscriptionStatus);
router.post('/:id/renew-or-upgrade', subscriptionController.renewOrUpgradeSubscription);

// Scene 5: Customer Self-Service Portal & Online Quotation Digital Acceptance
router.get('/portal/:customerId', customerPortalController.getCustomerPortalOverview);
router.post('/portal/:id/accept-quotation', customerPortalController.acceptQuotationInPortal);
router.post('/portal/:id/self-service', customerPortalController.executeCustomerSelfServiceAction);

module.exports = router;
