var express = require('express');
var router = express.Router();

/* Controllers */
var defaultController = require('../controllers/defaultController');


/* ==========================================================================
   Front-End Website
   ========================================================================== */

// Health
router.get('/health', function(req, res) {
  res.json({
    status: 'ok'
  });
});

// Test Routes
router.get('/', (req, res) => defaultController.index(req, res));
router.get('/checkBalance', (req, res) => defaultController.checkBalance(req, res));
// router.get('/sendMoney', (req, res) => defaultController.sendMoney(req, res));
// router.get('/getData', (req, res) => defaultController.getData(req, res));

// Official API Routes
router.post('/api/makePackageContract', (req, res) => defaultController.makePackageContract(req, res));
router.post('/api/payForPackage', (req, res) => defaultController.payForPackage(req, res));
router.post('/api/updateCarrierInformation', (req, res) => defaultController.updateCarrierInformation(req, res));
router.post('/api/finalizeDelivery', (req, res) => defaultController.finalizeDelivery(req, res));

module.exports = router;