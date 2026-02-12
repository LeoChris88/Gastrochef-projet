const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProfile,
  getOrderHistory,
  getStats,
  resetDiscoveredRecipes
} = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.get('/orders', auth, getOrderHistory);
router.get('/stats', auth, getStats);
router.post('/reset-recipes', auth, resetDiscoveredRecipes);

module.exports = router;