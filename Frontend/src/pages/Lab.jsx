import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../Styles/Lab.css";

const ingredientsList = [
  "Tomate", "Mozzarella", "Basilic",
  "Oeuf", "Sel", "Pâtes", "Poivre",
  "Pain", "Oignon", "Bouillon", "Parmesan"
];

function Lab() {
  const [grid, setGrid] = useState(Array(9).fill(null));
  const [message, setMessage] = useState("");
  const [recipes, setRecipes] = useState([]);

  // SERVICE
  const [socket, setSocket] = useState(null);
  const [orders, setOrders] = useState([]);
  const [serviceStarted, setServiceStarted] = useState(false);
  const [satisfaction, setSatisfaction] = useState(20);

  const token = localStorage.getItem("token");

  /* ================= LAB ================= */

  const handleDragStart = (ingredient) => {
    window.draggedIngredient = ingredient;
  };

  const handleDrop = (index) => {
    const newGrid = [...grid];
    newGrid[index] = window.draggedIngredient;
    setGrid(newGrid);
  };

  const allowDrop = (e) => e.preventDefault();

  const testRecipe = async () => {
    const selectedIngredients = grid.filter(Boolean);

    if (selectedIngredients.length === 0) {
      setMessage("Ajoute des ingrédients dans la grille !");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/recipes/test",
        { ingredients: selectedIngredients },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setGrid(Array(9).fill(null));
      fetchRecipes();
    } catch {
      setMessage("❌ Aucune recette trouvée");
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/recipes/discovered",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SERVICE ================= */

  const startService = async () => {
    try {
      // 🔄 Reset recettes côté serveur
      await axios.post(
        "http://localhost:5000/api/user/reset-recipes",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecipes([]);

      const newSocket = io("http://localhost:5000", {
        auth: { token }
      });

      setSocket(newSocket);
      setServiceStarted(true);

      newSocket.on("authenticated", (data) => {
        setSatisfaction(data.satisfaction);
      });

      newSocket.on("new-order", (order) => {
        setOrders((prev) => [...prev, order]);
      });

      newSocket.on("satisfaction-update", (data) => {
        setSatisfaction(data.satisfaction);
      });

      newSocket.on("order-result", ({ orderId, status, message, satisfaction }) => {
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        setMessage(message);
        setSatisfaction(satisfaction);
      });

      newSocket.on("order-rejected", ({ orderId }) => {
        setOrders((prev) => prev.filter(o => o.orderId !== orderId));
      });

      newSocket.emit("start-service");
    } catch (error) {
      console.error("Erreur start service:", error);
    }
  };

  const serveOrder = (orderId) => {
    socket.emit("process-order", { orderId, action: "serve" });
  };

  /* ================= INIT ================= */

  useEffect(() => {
    fetchRecipes();
  }, []);

  /* ================= UI ================= */

  return (
    <div className="lab-container">
      <h2>🧪 Laboratoire</h2>

      {!serviceStarted && (
        <button className="start-btn" onClick={startService}>
          🚀 Démarrer le service
        </button>
      )}

      {serviceStarted && (
        <>
          <h3>⭐ Satisfaction : {satisfaction}</h3>

          <div className="orders">
            <h3>📦 Commandes en cours</h3>
            {orders.map(order => (
              <div key={order.orderId} className="order-card">
                <strong>{order.recipe.name}</strong>
                <button onClick={() => serveOrder(order.orderId)}>
                  Servir
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <hr />

      {/* LAB TOUJOURS ACTIF */}
      <h3>🥕 Ingrédients</h3>
      <div className="ingredients-bar">
        {ingredientsList.map((ing) => (
          <div
            key={ing}
            className="ingredient"
            draggable
            onDragStart={() => handleDragStart(ing)}
          >
            {ing}
          </div>
        ))}
      </div>

      <h3>🧱 Table de Craft</h3>
      <div className="craft-grid">
        {grid.map((cell, index) => (
          <div
            key={index}
            className="craft-cell"
            onDrop={() => handleDrop(index)}
            onDragOver={allowDrop}
          >
            {cell}
          </div>
        ))}
      </div>

      <button className="test-btn" onClick={testRecipe}>
        Tester la recette
      </button>

      <h3 className="message">{message}</h3>

      <hr />

      <h3>📖 Recettes découvertes</h3>
      {recipes.length === 0 ? (
        <p>Aucune recette découverte</p>
      ) : (
        <ul>
          {recipes.map((r) => (
            <li key={r._id}>{r.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Lab;