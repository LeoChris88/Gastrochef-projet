const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Récupérer la trésorerie actuelle
exports.getTreasury = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('treasury restaurantName');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({ 
      treasury: user.treasury,
      restaurantName: user.restaurantName
    });
  } catch (error) {
    console.error('Erreur getTreasury:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Historique des transactions
exports.getTransactions = async (req, res) => {
  try {
    const { limit = 50, type, category } = req.query;
    
    const filter = { userId: req.userId };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter)
      .populate('relatedRecipe', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    console.error('Erreur getTransactions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Statistiques financières
exports.getFinancialStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Revenus totaux
    const totalIncome = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Dépenses totales
    const totalExpenses = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Répartition par catégorie
    const expensesByCategory = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    // Évolution sur les 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const treasuryEvolution = await Transaction.aggregate([
      { $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      { $sort: { createdAt: 1 } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          income: { 
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          expense: { 
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Trésorerie actuelle
    const user = await User.findById(userId).select('treasury');

    res.json({
      treasury: user.treasury,
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      netProfit: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      expensesByCategory,
      treasuryEvolution
    });
  } catch (error) {
    console.error('Erreur getFinancialStats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une transaction (utilitaire interne)
exports.createTransaction = async (userId, type, category, amount, description, relatedOrder = null, relatedRecipe = null) => {
  try {
    const transaction = await Transaction.create({
      userId,
      type,
      category,
      amount,
      description,
      relatedOrder,
      relatedRecipe
    });

    // Mettre à jour la trésorerie
    const modifier = type === 'income' ? amount : -amount;
    await User.findByIdAndUpdate(userId, { $inc: { treasury: modifier } });

    return transaction;
  } catch (error) {
    console.error('Erreur createTransaction:', error);
    throw error;
  }
};