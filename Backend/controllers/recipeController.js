const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Tester une recette avec des ingrédients
exports.testRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Veuillez fournir au moins un ingrédient' });
    }

    const normalizedIngredients = ingredients
      .map(ing => ing.toLowerCase().trim())
      .sort();
      
    const allRecipes = await Recipe.find({}).populate('ingredients.ingredient');

    let matchedRecipe = null;

    for (const recipe of allRecipes) {
      const recipeIngredientNames = recipe.ingredients
        .map(item => item.ingredient.name.toLowerCase().trim())
        .sort();

      // Comparer les tableaux
      if (JSON.stringify(recipeIngredientNames) === JSON.stringify(normalizedIngredients)) {
        matchedRecipe = recipe;
        break;
      }
    }

    if (!matchedRecipe) {
      return res.json({
        success: false,
        message: 'Aucune recette ne correspond à ces ingrédients.'
      });
    }

    // Vérifier si déjà découverte
    const user = await User.findById(req.userId);
    const alreadyDiscovered = user.discoveredRecipes.some(
      id => id.toString() === matchedRecipe._id.toString()
    );

    let newDiscovery = false;

    if (!alreadyDiscovered) {
      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { discoveredRecipes: matchedRecipe._id },
        $inc: { reputation: 10 }
      });
      newDiscovery = true;
    }

    res.json({
      success: true,
      message: `Recette découverte : ${matchedRecipe.name}`,
      recipe: {
        _id: matchedRecipe._id,
        name: matchedRecipe.name,
        ingredients: matchedRecipe.ingredients.map(item => ({
          name: item.ingredient.name,
          quantity: item.quantity
        })),
        salePrice: matchedRecipe.salePrice,
        category: matchedRecipe.category,
        difficulty: matchedRecipe.difficulty
      },
      newDiscovery
    });

  } catch (error) {
    console.error('Erreur testRecipe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les recettes découvertes
exports.getDiscoveredRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'discoveredRecipes',
        populate: { path: 'ingredients.ingredient' }
      });

    const formattedRecipes = user.discoveredRecipes.map(recipe => ({
      _id: recipe._id,
      name: recipe.name,
      ingredients: recipe.ingredients.map(item => ({
        name: item.ingredient.name,
        quantity: item.quantity
      })),
      salePrice: recipe.salePrice,
      category: recipe.category,
      difficulty: recipe.difficulty
    }));

    res.json({ discovered: formattedRecipes });
  } catch (error) {
    console.error('Erreur getDiscoveredRecipes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Toutes les recettes (admin/debug)
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({}).populate('ingredients.ingredient');

    const formattedRecipes = recipes.map(recipe => ({
      _id: recipe._id,
      name: recipe.name,
      ingredients: recipe.ingredients.map(item => ({
        name: item.ingredient.name,
        quantity: item.quantity
      })),
      salePrice: recipe.salePrice,
      category: recipe.category,
      difficulty: recipe.difficulty
    }));

    res.json(formattedRecipes);
  } catch (error) {
    console.error('Erreur getAllRecipes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};