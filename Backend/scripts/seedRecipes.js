const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

const seedRecipes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    // Récupére tous les ingrédients
    const ingredients = await Ingredient.find({});
    const ingredientMap = {};
    ingredients.forEach(ing => {
      ingredientMap[ing.name] = ing._id;
    });

    console.log('Ingrédients trouvés:', Object.keys(ingredientMap));

    // Recettes avec références
    const recipes = [
      {
        name: 'Salade Caprese',
        ingredients: [
          { ingredient: ingredientMap['tomate'], quantity: 2 },
          { ingredient: ingredientMap['mozzarella'], quantity: 1 },
          { ingredient: ingredientMap['basilic'], quantity: 1 }
        ],
        salePrice: 12,
        category: 'entrée',
        difficulty: 1
      },
      {
        name: 'Omelette',
        ingredients: [
          { ingredient: ingredientMap['oeuf'], quantity: 3 },
          { ingredient: ingredientMap['sel'], quantity: 1 },
          { ingredient: ingredientMap['poivre'], quantity: 1 }
        ],
        salePrice: 8,
        category: 'plat',
        difficulty: 1
      },
      {
        name: 'Pâtes Carbonara',
        ingredients: [
          { ingredient: ingredientMap['pâtes'], quantity: 1 },
          { ingredient: ingredientMap['lardons'], quantity: 1 },
          { ingredient: ingredientMap['oeuf'], quantity: 2 },
          { ingredient: ingredientMap['parmesan'], quantity: 1 }
        ],
        salePrice: 15,
        category: 'plat',
        difficulty: 2
      },
      {
        name: 'Bruschetta',
        ingredients: [
          { ingredient: ingredientMap['pain'], quantity: 2 },
          { ingredient: ingredientMap['tomate'], quantity: 2 },
          { ingredient: ingredientMap['ail'], quantity: 1 },
          { ingredient: ingredientMap["huile d'olive"], quantity: 1 }
        ],
        salePrice: 10,
        category: 'entrée',
        difficulty: 1
      },
      {
        name: 'Soupe à l\'oignon',
        ingredients: [
          { ingredient: ingredientMap['oignon'], quantity: 3 },
          { ingredient: ingredientMap['bouillon'], quantity: 1 },
          { ingredient: ingredientMap['pain'], quantity: 1 },
          { ingredient: ingredientMap['gruyère'], quantity: 1 }
        ],
        salePrice: 9,
        category: 'entrée',
        difficulty: 2
      }
    ];

    await Recipe.deleteMany({});
    console.log('Recettes supprimées');

    await Recipe.insertMany(recipes);
    console.log(`${recipes.length} recettes insérées`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
};

seedRecipes();