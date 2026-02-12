const Recipe = require('../models/Recipe');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  const players = new Map();

  // Middleware : Authentification
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Auth error'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);
      
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch (e) { 
      next(new Error('Invalid token')); 
    }
  });

  const updateSatisfaction = async (socket, amount) => {
    const user = await User.findByIdAndUpdate(
      socket.user._id, 
      { $inc: { satisfaction: amount } }, 
      { new: true }
    );
    
    socket.emit('satisfaction-update', { satisfaction: user.satisfaction });
    
    if (user.satisfaction < 0) {
      const p = players.get(socket.id);
      if (p?.interval) clearInterval(p.interval);
      socket.emit('game-over', { 
        message: 'Satisfaction trop basse !',
        finalSatisfaction: user.satisfaction
      });
    }
    return user;
  };

  io.on('connection', (socket) => {
    console.log(`${socket.user.restaurantName} connecté (ID: ${socket.id})`);
    
    // Envoyer l'état initial
    socket.emit('authenticated', {
      userId: socket.user._id,
      restaurantName: socket.user.restaurantName,
      satisfaction: socket.user.satisfaction
    });

    players.set(socket.id, { interval: null });

    socket.on('start-service', async () => {
      const p = players.get(socket.id);
      if (p.interval) return socket.emit('error', { message: 'Service déjà en cours' });

      console.log(`Service démarré : ${socket.user.restaurantName}`);
      socket.emit('service-started', { message: 'Service démarré !' });

      const generate = async () => {
        try {
          const user = await User.findById(socket.user._id).populate('discoveredRecipes');
          
          if (user.satisfaction < 0) {
            clearInterval(p.interval);
            return;
          }

          if (!user.discoveredRecipes.length) {
            return socket.emit('error', { message: 'Aucune recette découverte !' });
          }

          const recipe = user.discoveredRecipes[Math.floor(Math.random() * user.discoveredRecipes.length)];
          const timeLimit = Math.floor(Math.random() * 31) + 30;
          const expiresAt = new Date(Date.now() + timeLimit * 1000);
          
          const order = await Order.create({ 
            userId: user._id, 
            recipe: recipe._id, 
            timeLimit,
            expiresAt 
          });

          socket.emit('new-order', { 
            orderId: order._id, 
            recipe: {
              _id: recipe._id,
              name: recipe.name,
              ingredients: recipe.ingredients
            }, 
            timeLimit,
            expiresAt
          });

          console.log(`Commande : ${recipe.name} (${timeLimit}s) → ${socket.user.restaurantName}`);
        } catch (error) {
          console.error('Erreur génération:', error);
          socket.emit('error', { message: 'Erreur génération commande' });
        }
      };

      // Première commande immédiate
      await generate();
      
      // Puis toutes les 15-25 secondes
      p.interval = setInterval(generate, Math.floor(Math.random() * 10000) + 15000);
    });

    socket.on('stop-service', () => {
      const p = players.get(socket.id);
      if (p?.interval) {
        clearInterval(p.interval);
        p.interval = null;
        console.log(`Service arrêté : ${socket.user.restaurantName}`);
        socket.emit('service-stopped', { message: 'Service arrêté' });
      }
    });

    socket.on('process-order', async ({ orderId, action }) => {
      try {
        const order = await Order.findOne({ 
          _id: orderId, 
          userId: socket.user._id 
        }).populate('recipe');
        
        if (!order) {
          return socket.emit('error', { message: 'Commande introuvable' });
        }

        if (order.status !== 'pending') {
          return socket.emit('error', { message: 'Commande déjà traitée' });
        }

        const isExpired = new Date() > order.expiresAt;
        const isServe = action === 'serve';
        
        // Déterminer le statut
        let status;
        let reward;
        let message;

        if (isServe && !isExpired) {
          // Succès
          status = 'completed';
          reward = 1;
          message = `Parfait ! ${order.recipe.name} servi !`;
          order.completedAt = new Date();
        } else if (isExpired) {
          // Trop tard
          status = 'expired';
          reward = -10;
          message = `Trop tard ! ${order.recipe.name} refroidi...`;
        } else {
          // Rejeté volontairement
          status = 'rejected';
          reward = -10;
          message = `Commande rejetée : ${order.recipe.name}`;
        }

        order.status = status;
        await order.save();

        const user = await updateSatisfaction(socket, reward);
        
        socket.emit(`order-${status}`, { 
          orderId, 
          message,
          satisfaction: user.satisfaction,
          reward
        });

        console.log(`${reward > 0 ? 'SUCCES' : 'ECHEC'} ${socket.user.restaurantName} : ${message}`);

      } catch (error) {
        console.error('Erreur process-order:', error);
        socket.emit('error', { message: 'Erreur serveur' });
      }
    });

    socket.on('disconnect', () => {
      const p = players.get(socket.id);
      if (p?.interval) clearInterval(p.interval);
      players.delete(socket.id);
      console.log(`${socket.user.restaurantName} déconnecté`);
    });
  });
};