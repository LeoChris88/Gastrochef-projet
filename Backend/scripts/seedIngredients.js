const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Ingredient = require('../models/Ingredient');

const ingredients = [
  { name: 'tomate', price: 2, unit: 'unité' },
  { name: 'mozzarella', price: 5, unit: 'boule' },
  { name: 'basilic', price: 3, unit: 'botte' },
  { name: 'oeuf', price: 0.5, unit: 'unité' },
  { name: 'sel', price: 1, unit: 'paquet' },
  { name: 'poivre', price: 2, unit: 'paquet' },
  { name: 'pâtes', price: 3, unit: 'paquet' },
  { name: 'lardons', price: 4, unit: 'barquette' },
  { name: 'parmesan', price: 6, unit: 'tranche' },
  { name: 'pain', price: 2, unit: 'unité' },
  { name: 'ail', price: 1, unit: 'gousse' },
  { name: "huile d'olive", price: 5, unit: 'bouteille' },
  { name: 'oignon', price: 1.5, unit: 'unité' },
  { name: 'bouillon', price: 3, unit: 'cube' },
  { name: 'gruyère', price: 5, unit: 'tranche' }
];

const seedIngredients = async () => {
  try {
    console.log('MONGO_URI:', process.env.MONGO_URI); // Debug
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    await Ingredient.deleteMany({});
    console.log('Ingrédients supprimés');

    await Ingredient.insertMany(ingredients);
    console.log(`${ingredients.length} ingrédients insérés`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
};

seedIngredients();