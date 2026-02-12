const User = require('../models/User');
const Order = require('../models/Order');

// Récupérer le profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('discoveredRecipes');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

// Récupérer l'historique des commandes
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate('recipe')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(orders);
  } catch (error) {
    console.error('Erreur getOrderHistory:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
  }
};

// Statistiques du joueur
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const totalOrders = await Order.countDocuments({ userId: req.userId });
    const completedOrders = await Order.countDocuments({ 
      userId: req.userId, 
      status: 'completed' 
    });
    const expiredOrders = await Order.countDocuments({ 
      userId: req.userId, 
      status: 'expired' 
    });
    const rejectedOrders = await Order.countDocuments({ 
      userId: req.userId, 
      status: 'rejected' 
    });

    res.json({
      restaurantName: user.restaurantName,
      satisfaction: user.satisfaction,
      reputation: user.reputation,
      discoveredRecipes: user.discoveredRecipes.length,
      totalOrders,
      completedOrders,
      expiredOrders,
      rejectedOrders,
      successRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};