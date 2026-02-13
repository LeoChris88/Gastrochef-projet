import { useState } from "react";
import "../Styles/Lab.css";

import CraftTable from "../components/CraftTable";
import OrdersPanel from "../components/OrdersPanel";
import GameOver from "../components/GameOver";

import { useRecipes } from "../hooks/useRecipes";
import { useService } from "../hooks/useService";
import { useTimer } from "../hooks/useTimer";

const ingredientsList = [
  "Tomate","Mozzarella","Basilic",
  "Oeuf","Sel","Pâtes","Poivre",
  "Pain","Oignon","Bouillon","Parmesan","gruyère"
];

function Lab() {
  const token = localStorage.getItem("token");
  const [grid, setGrid] = useState(Array(9).fill(null));

  const { recipes, message, testRecipe } = useRecipes(token);

  const {
    orders,
    satisfaction,
    serviceStarted,
    startService,
    serveOrder,
    stopService,
    setOrders,
  } = useService(token);

  useTimer(serviceStarted, setOrders);

  const handleRestart = () => {
    stopService();
  };

  if (satisfaction <= 0 && serviceStarted) {
    return <GameOver onRestart={handleRestart} />;
  }

  return (
    <div className="lab-container">
      <h2>🧪 Laboratoire</h2>

      {!serviceStarted && (
        <button onClick={startService}>
          🚀 Démarrer le service
        </button>
      )}

      {serviceStarted && (
        <OrdersPanel
          orders={orders}
          serveOrder={serveOrder}
          satisfaction={satisfaction}
        />
      )}

      <hr />

      <CraftTable
        grid={grid}
        setGrid={setGrid}
        ingredients={ingredientsList}
        onTestRecipe={testRecipe}
      />

      <h3>{message}</h3>

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