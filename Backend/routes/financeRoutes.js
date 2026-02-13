const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTreasury, getTransactions, getFinancialStats } = require('../controllers/financeController');

router.get('/treasury', auth, getTreasury);
router.get('/transactions', auth, getTransactions);
router.get('/stats', auth, getFinancialStats);

module.exports = router;