const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [{ 
    ingredient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Ingredient',
      required: true
    },
    quantity: { 
      type: Number, 
      required: true,
      default: 1
    }
  }],
  salePrice: { type: Number, required: true, default: 15 },
  category: { type: String },
  difficulty: { type: Number, default: 1 }
});

module.exports = mongoose.model('Recipe', recipeSchema);