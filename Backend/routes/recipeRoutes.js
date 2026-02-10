const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { testRecipe, getDiscoveredRecipes, getAllRecipes } = require('../controllers/recipeController');

router.post('/test', auth, testRecipe);
router.get('/discovered', auth, getDiscoveredRecipes);
router.get('/all', getAllRecipes);

module.exports = router;