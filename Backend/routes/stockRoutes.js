const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStock, buyIngredients } = require('../controllers/stockController');

router.get('/', auth, getStock);
router.post('/buy', auth, buyIngredients);

module.exports = router;