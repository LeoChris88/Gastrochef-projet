const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  category: {
    type: String,
    enum: ['sale', 'ingredient_purchase', 'penalty', 'bonus'],
    required: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  relatedOrder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  },
  relatedRecipe: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recipe' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);