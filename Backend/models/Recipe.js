const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  category: { type: String },
  difficulty: { type: Number, default: 1 }
});

module.exports = mongoose.model('Recipe', recipeSchema);