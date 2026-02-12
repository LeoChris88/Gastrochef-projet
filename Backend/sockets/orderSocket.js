const Recipe = require("../models/Recipe");
const Order = require("../models/Order");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports = (io) => {
  const players = new Map(); // Stocke les timers par joueur

  /* ================= AUTH SOCKET ================= */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error("Auth error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  /* ================= SATISFACTION ================= */
  const updateSatisfaction = async (socket, amount) => {
    const user = await User.findByIdAndUpdate(
      socket.user._id,
      { $inc: { satisfaction: amount } },
      { new: true }
    );

    socket.emit("satisfaction-update", { satisfaction: user.satisfaction });

    if (user.satisfaction < 0) {
      const player = players.get(socket.id);
      if (player?.interval) clearInterval(player.interval);

      socket.emit("game-over", {
        message: "Ton restaurant a fermé… Trop d'avis négatifs !",
        finalSatisfaction: user.satisfaction,
      });
    }

    return user;
  };

  /* ================= CONNEXION ================= */
  io.on("connection", (socket) => {
    console.log(`${socket.user.restaurantName} connecté`);

    players.set(socket.id, { interval: null });

    socket.emit("authenticated", {
      restaurantName: socket.user.restaurantName,
      satisfaction: socket.user.satisfaction,
    });

    /* ================= DEMARRER SERVICE ================= */
    socket.on("start-service", async () => {
      const player = players.get(socket.id);
      if (player.interval) return;

      console.log(`Service démarré pour ${socket.user.restaurantName}`);

      // 🔥 RESET recettes découvertes au début du service
      await User.findByIdAndUpdate(socket.user._id, { discoveredRecipes: [] });

      socket.emit("service-started");

      const generateOrder = async () => {
        try {
          const user = await User.findById(socket.user._id);

          if (user.satisfaction < 0) return;

          // 🔥 On prend TOUTES les recettes du jeu
          const recipes = await Recipe.find();

          if (!recipes.length) return;

          const recipe = recipes[Math.floor(Math.random() * recipes.length)];

          const timeLimit = Math.floor(Math.random() * 20) + 25; // 25–45 sec
          const expiresAt = new Date(Date.now() + timeLimit * 1000);

          const order = await Order.create({
            userId: user._id,
            recipe: recipe._id,
            timeLimit: timeLimit,
            expiresAt: expiresAt,
            status: "pending",
          });

          socket.emit("new-order", {
            orderId: order._id,
            recipe: {
              name: recipe.name,
              ingredients: recipe.ingredients,
            },
            timeLimit,
            expiresAt,
          });

        } catch (err) {
          console.error("Erreur génération commande :", err);
        }
      };

      // Première commande immédiate
      generateOrder();

      // Puis toutes les 20 secondes
      player.interval = setInterval(generateOrder, 20000);
    });

    /* ================= ARRET SERVICE ================= */
    socket.on("stop-service", () => {
      const player = players.get(socket.id);
      if (player?.interval) clearInterval(player.interval);
      players.set(socket.id, { interval: null });

      socket.emit("service-stopped");
      console.log(`Service arrêté pour ${socket.user.restaurantName}`);
    });

    socket.on("process-order", async ({ orderId, action }) => {
      try {
        const order = await Order.findOne({
          _id: orderId,
          userId: socket.user._id,
        }).populate("recipe");

        if (!order || order.status !== "pending") return;

        const user = await User.findById(socket.user._id).populate("discoveredRecipes");

        // 🔒 Vérifie si la recette est découverte
        const knowsRecipe = user.discoveredRecipes.some(
          (r) => r._id.toString() === order.recipe._id.toString()
        );

        const expired = new Date() > order.expiresAt;

        let reward = 0;
        let status = "";
        let message = "";

        if (action === "serve" && !expired && knowsRecipe) {
          status = "completed";
          reward = +1;
          message = `Plat servi avec succès : ${order.recipe.name}`;
        } else if (!knowsRecipe) {
          status = "rejected";
          reward = -10;
          message = `Recette inconnue ! Client mécontent 😡`;
        } else {
          status = expired ? "expired" : "rejected";
          reward = -10;
          message = expired
            ? `Trop tard pour ${order.recipe.name}`
            : `Commande rejetée`;
        }

        order.status = status;
        await order.save();

        const updatedUser = await updateSatisfaction(socket, reward);

        socket.emit("order-result", {
          orderId,
          status,
          message,
          reward,
          satisfaction: updatedUser.satisfaction,
        });
      } catch (err) {
        console.error(err);
      }
    });

    /* ================= DECONNEXION ================= */
    socket.on("disconnect", () => {
      const player = players.get(socket.id);
      if (player?.interval) clearInterval(player.interval);
      players.delete(socket.id);
      console.log(`${socket.user.restaurantName} déconnecté`);
    });
  });
};