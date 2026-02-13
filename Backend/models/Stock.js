const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  ingredient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ingredient', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    default: 0,
    min: 0
  }
});

stockSchema.index({ userId: 1, ingredient: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);