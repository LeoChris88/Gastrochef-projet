const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Tester une combinaison d'ingrédients
exports.testRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;
    const userId = req.userId;

    const sortedIngredients = ingredients.map(i => i.toLowerCase().trim()).sort();

    const recipe = await Recipe.findOne({
      ingredients: { $all: sortedIngredients, $size: sortedIngredients.length }
    });

    if (recipe) {
      const user = await User.findById(userId);
      const alreadyDiscovered = user.discoveredRecipes.includes(recipe._id);

      if (!alreadyDiscovered) {
        await User.findByIdAndUpdate(userId, {
          $push: { discoveredRecipes: recipe._id },
          $inc: { reputation: 10 }
        });

        return res.json({
          success: true,
          message: `🎉 Nouvelle recette découverte : ${recipe.name} !`,
          recipe,
          newDiscovery: true
        });
      }

      return res.json({
        success: true,
        message: `Recette déjà connue : ${recipe.name}`,
        recipe,
        newDiscovery: false
      });
    }

    res.json({
      success: false,
      message: '❌ Aucune recette ne correspond à cette combinaison'
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du test de recette' });
  }
};

// Récupérer les recettes découvertes
exports.getDiscoveredRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('discoveredRecipes');
    res.json(user.discoveredRecipes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des recettes' });
  }
};

// Récupérer toutes les recettes
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des recettes' });
  }
};