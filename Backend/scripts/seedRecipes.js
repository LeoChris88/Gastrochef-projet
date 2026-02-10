require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const connectDB = require('../config/db');

const recipes = [
  { name: "Salade Caprese", ingredients: ["tomate", "mozzarella", "basilic"] },
  { name: "Omelette", ingredients: ["oeuf", "sel", "poivre"] },
  { name: "Pâtes Carbonara", ingredients: ["pâtes", "lardons", "oeuf", "parmesan"] },
  { name: "Bruschetta", ingredients: ["pain", "tomate", "ail", "huile d'olive"] },
  { name: "Soupe à l'oignon", ingredients: ["oignon", "bouillon", "pain", "gruyère"] }
];

const seedDB = async () => {
  await connectDB();
  await Recipe.deleteMany({});
  await Recipe.insertMany(recipes);
  console.log('✅ Recettes ajoutées !');
  mongoose.connection.close();
};

seedDB();