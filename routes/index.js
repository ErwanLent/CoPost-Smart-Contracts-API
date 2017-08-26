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
router.get('/getNewNumber', (req, res) => defaultController.getNewNumber(req, res));

module.exports = router;