const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'expired', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  timeLimit: { type: Number, required: true },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);