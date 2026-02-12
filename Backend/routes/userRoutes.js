const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, getOrderHistory, getStats } = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.get('/orders', auth, getOrderHistory);
router.get('/stats', auth, getStats);

module.exports = router;