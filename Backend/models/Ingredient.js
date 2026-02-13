const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  price: { 
    type: Number, 
    required: true,
    default: 5 
  },
  unit: { 
    type: String, 
    default: 'unité' 
  }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);