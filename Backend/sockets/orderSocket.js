const Recipe = require("../models/Recipe");
const Order = require("../models/Order");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { checkRecipeStock, consumeRecipeIngredients } = require('../controllers/stockController');
const { createTransaction } = require('../controllers/financeController');

module.exports = (io) => {
  const players = new Map();

  // Middleware d'authentification Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error("Auth error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);

      if (!socket.user) return next(new Error("User not found"));
      next();
    } catch (e) {
      next(new Error("Invalid token"));
    }
  });

  // Fonction pour mettre à jour la satisfaction
  const updateSatisfaction = async (socket, amount) => {
    const user = await User.findByIdAndUpdate(
      socket.user._id,
      { $inc: { satisfaction: amount } },
      { new: true }
    );

    socket.emit("satisfaction-update", { satisfaction: user.satisfaction });

    if (user.satisfaction < 0) {
      const p = players.get(socket.id);
      if (p?.interval) clearInterval(p.interval);
      socket.emit("game-over", {
        message: "Satisfaction trop basse ! Restaurant fermé.",
        finalSatisfaction: user.satisfaction,
      });
    }
    return user;
  };

  io.on("connection", (socket) => {
    console.log(`${socket.user.restaurantName} connecté (ID: ${socket.id})`);

    socket.emit("authenticated", {
      userId: socket.user._id,
      restaurantName: socket.user.restaurantName,
      satisfaction: socket.user.satisfaction,
      treasury: socket.user.treasury,
    });

    players.set(socket.id, { interval: null });

    // Démarrer le service
    socket.on("start-service", async () => {
      const p = players.get(socket.id);
      if (p.interval) {
        return socket.emit("error", { message: "Service déjà en cours" });
      }

      console.log(`Service démarré : ${socket.user.restaurantName}`);
      socket.emit("service-started", { message: "Service démarré !" });

      const generate = async () => {
        try {
          const user = await User.findById(socket.user._id).populate({
            path: 'discoveredRecipes',
            populate: { path: 'ingredients.ingredient' }
          });

          if (user.satisfaction < 0) {
            clearInterval(p.interval);
            return;
          }

          if (!user.discoveredRecipes || user.discoveredRecipes.length === 0) {
            return socket.emit("error", {
              message: "Aucune recette découverte ! Allez au labo d'abord.",
            });
          }

          const recipe = user.discoveredRecipes[
            Math.floor(Math.random() * user.discoveredRecipes.length)
          ];
          
          const timeLimit = Math.floor(Math.random() * 31) + 30;
          const expiresAt = new Date(Date.now() + timeLimit * 1000);

          const order = await Order.create({
            userId: user._id,
            recipe: recipe._id,
            timeLimit,
            expiresAt,
          });

          socket.emit("new-order", {
            orderId: order._id,
            recipe: {
              _id: recipe._id,
              name: recipe.name,
              ingredients: recipe.ingredients.map(item => ({
                name: item.ingredient.name,
                quantity: item.quantity
              })),
              salePrice: recipe.salePrice,
            },
            timeLimit,
            expiresAt,
          });

          console.log(
            `Commande : ${recipe.name} (${timeLimit}s) → ${socket.user.restaurantName}`
          );
        } catch (error) {
          console.error("Erreur génération:", error);
          socket.emit("error", { message: "Erreur génération commande" });
        }
      };

      await generate();
      
      p.interval = setInterval(generate, Math.floor(Math.random() * 10000) + 15000);
    });

    // Arrêter le service
    socket.on("stop-service", () => {
      const p = players.get(socket.id);
      if (p?.interval) {
        clearInterval(p.interval);
        p.interval = null;
        console.log(`⏸️ Service arrêté : ${socket.user.restaurantName}`);
        socket.emit("service-stopped", { message: "Service arrêté" });
      }
    });

    socket.on("process-order", async ({ orderId, action }) => {
      try {
        const order = await Order.findOne({
          _id: orderId,
          userId: socket.user._id,
        }).populate({
          path: 'recipe',
          populate: { path: 'ingredients.ingredient' }
        });

        if (!order) {
          return socket.emit("error", { message: "Commande introuvable" });
        }

        if (order.status !== "pending") {
          return socket.emit("error", { message: "Commande déjà traitée" });
        }

        const isExpired = new Date() > order.expiresAt;
        const isServe = action === "serve";

        let status;
        let satisfactionReward = 0;
        let treasuryChange = 0;
        let message;

        if (isServe && !isExpired) {
          const stockCheck = await checkRecipeStock(order.recipe._id, socket.user._id);
          
          if (!stockCheck.available) {
            status = 'rejected';
            satisfactionReward = -10;
            treasuryChange = -5;
            message = `Stock insuffisant pour ${order.recipe.name} (-5€)`;
            
            await createTransaction(
              socket.user._id,
              'expense',
              'penalty',
              5,
              `Pénalité : stock insuffisant pour ${order.recipe.name}`,
              order._id,
              order.recipe._id
            );
          } else {
            // Succès : consommer les ingrédients et encaisser
            await consumeRecipeIngredients(order.recipe._id, socket.user._id);
            
            status = "completed";
            satisfactionReward = 1;
            treasuryChange = order.recipe.salePrice;
            message = `Parfait ! ${order.recipe.name} servi pour ${order.recipe.salePrice}€`;
            order.completedAt = new Date();
            
            await createTransaction(
              socket.user._id,
              'income',
              'sale',
              order.recipe.salePrice,
              `Vente : ${order.recipe.name}`,
              order._id,
              order.recipe._id
            );
          }
        } else if (isExpired) {
          status = "expired";
          satisfactionReward = -10;
          treasuryChange = -10;
          message = `Trop tard ! ${order.recipe.name} refroidi... (-10€)`;
          
          await createTransaction(
            socket.user._id,
            'expense',
            'penalty',
            10,
            `Pénalité : commande expirée (${order.recipe.name})`,
            order._id,
            order.recipe._id
          );
        } else {
          status = "rejected";
          satisfactionReward = -10;
          treasuryChange = -5;
          message = `Commande rejetée : ${order.recipe.name} (-5€)`;
          
          await createTransaction(
            socket.user._id,
            'expense',
            'penalty',
            5,
            `Pénalité : commande rejetée (${order.recipe.name})`,
            order._id,
            order.recipe._id
          );
        }

        order.status = status;
        await order.save();

        const user = await updateSatisfaction(socket, satisfactionReward);

        // Mise à jour de la trésorerie
        socket.emit('treasury-update', { treasury: user.treasury });

        socket.emit(`order-${status}`, {
          orderId,
          message,
          satisfaction: user.satisfaction,
          treasury: user.treasury,
          satisfactionReward,
          treasuryChange,
        });

        console.log(
          `${satisfactionReward > 0 ? "✅" : "❌"} ${socket.user.restaurantName} : ${message}`
        );
      } catch (error) {
        console.error("Erreur process-order:", error);
        socket.emit("error", { message: "Erreur serveur" });
      }
    });

    // Déconnexion
    socket.on("disconnect", () => {
      const p = players.get(socket.id);
      if (p?.interval) clearInterval(p.interval);
      players.delete(socket.id);
      console.log(`${socket.user.restaurantName} déconnecté`);
    });
  });
};