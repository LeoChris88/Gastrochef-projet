const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  discoveredRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  reputation: { type: Number, default: 20 }
});

module.exports = mongoose.model('User', userSchema);
