const Stock = require('../models/Stock');
const Ingredient = require('../models/Ingredient');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { createTransaction } = require('./financeController');

// Récupérer le stock complet de l'utilisateur
exports.getStock = async (req, res) => {
  try {
    const stock = await Stock.find({ userId: req.userId })
      .populate('ingredient');

    res.json(stock);
  } catch (error) {
    console.error('Erreur getStock:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Acheter des ingrédients
exports.buyIngredients = async (req, res) => {
  try {
    const { ingredientId, quantity } = req.body;

    if (!ingredientId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Données invalides' });
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrédient introuvable' });
    }

    const totalCost = ingredient.price * quantity;

    // Vérifier que l'utilisateur a assez d'argent
    const user = await User.findById(req.userId);
    if (user.treasury < totalCost) {
      return res.status(400).json({ 
        message: 'Fonds insuffisants',
        required: totalCost,
        available: user.treasury
      });
    }

    // Mettre à jour le stock
    let stockItem = await Stock.findOne({ 
      userId: req.userId, 
      ingredient: ingredientId 
    });

    if (stockItem) {
      stockItem.quantity += quantity;
      await stockItem.save();
    } else {
      stockItem = await Stock.create({
        userId: req.userId,
        ingredient: ingredientId,
        quantity
      });
    }

    // Créer la transaction
    await createTransaction(
      req.userId,
      'expense',
      'ingredient_purchase',
      totalCost,
      `Achat de ${quantity} ${ingredient.name}(s)`,
      null,
      null
    );

    // Récupérer le stock mis à jour
    const updatedStock = await Stock.findById(stockItem._id).populate('ingredient');

    res.json({
      message: `${quantity} ${ingredient.name}(s) acheté(s) pour ${totalCost}€`,
      stock: updatedStock,
      newTreasury: user.treasury - totalCost
    });

  } catch (error) {
    console.error('Erreur buyIngredients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Vérifier si le joueur a les ingrédients pour une recette
exports.checkRecipeStock = async (recipeId, userId) => {
  try {
    const recipe = await Recipe.findById(recipeId).populate('ingredients.ingredient');
    
    if (!recipe) return { available: false, message: 'Recette introuvable' };

    const missingIngredients = [];

    for (const recipeIng of recipe.ingredients) {
      const stockItem = await Stock.findOne({
        userId,
        ingredient: recipeIng.ingredient._id
      });

      if (!stockItem || stockItem.quantity < recipeIng.quantity) {
        missingIngredients.push({
          name: recipeIng.ingredient.name,
          needed: recipeIng.quantity,
          available: stockItem?.quantity || 0
        });
      }
    }

    return {
      available: missingIngredients.length === 0,
      missingIngredients
    };

  } catch (error) {
    console.error('Erreur checkRecipeStock:', error);
    return { available: false, message: 'Erreur de vérification' };
  }
};

// Consommer les ingrédients d'une recette
exports.consumeRecipeIngredients = async (recipeId, userId) => {
  try {
    const recipe = await Recipe.findById(recipeId).populate('ingredients.ingredient');

    for (const recipeIng of recipe.ingredients) {
      await Stock.findOneAndUpdate(
        { userId, ingredient: recipeIng.ingredient._id },
        { $inc: { quantity: -recipeIng.quantity } }
      );
    }

    return true;
  } catch (error) {
    console.error('Erreur consumeRecipeIngredients:', error);
    return false;
  }
};