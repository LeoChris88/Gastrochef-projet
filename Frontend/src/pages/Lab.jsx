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

  const {
    recipes,
    message,
    testRecipe,
    clearRecipes,
  } = useRecipes(token);

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
    setOrders([]);
  };

  if (satisfaction <= 0 && serviceStarted) {
    return <GameOver onRestart={handleRestart} />;
  }

  return (
    <div className="lab-container">
      <section className="service-section">
        <h2 className="section-title">🧪 LABORATOIRE</h2>
        {!serviceStarted ? (
          <button onClick={startService} className="start-button">
            🚀 Démarrer le service
          </button>
        ) : null}
      </section>

      <hr />

      <section className="craft-section">
        <h3 className="section-subtitle">🍊 INGRÉDIENTS</h3>
        <CraftTable
          grid={grid}
          setGrid={setGrid}
          ingredients={ingredientsList}
          onTestRecipe={testRecipe}
        />
        <h3>{message}</h3>
      </section>

      <hr />

      <section className="recipes-section">
        <h3 className="section-subtitle">📚 RECETTES DÉCOUVERTES</h3>
        {!recipes || !Array.isArray(recipes) || recipes.length === 0 ? (
          <p>Aucune recette découverte</p>
        ) : (
          <ul>
            {recipes.map((r) => (
              <li key={r._id}>{r.name}</li>
            ))}
          </ul>
        )}
      </section>

      {serviceStarted && (
        <>
          <hr />
          <OrdersPanel
            orders={orders}
            serveOrder={serveOrder}
            satisfaction={satisfaction}
          />
        </>
      )}
    </div>
  );
}

export default Lab;