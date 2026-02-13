const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  reputation: { type: Number, default: 0 },
  satisfaction: { type: Number, default: 20 }, 
  treasury: { type: Number, default: 100 },
  discoveredRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
