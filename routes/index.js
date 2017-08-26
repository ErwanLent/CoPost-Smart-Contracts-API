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

// Home Page
router.get('/', (req, res) => defaultController.index(req, res));
router.get('/checkBalance', (req, res) => defaultController.checkBalance(req, res));
router.get('/sendMoney', (req, res) => defaultController.sendMoney(req, res));
router.get('/getData', (req, res) => defaultController.getData(req, res));

module.exports = router;