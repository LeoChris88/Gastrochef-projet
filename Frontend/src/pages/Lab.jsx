import { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/Lab.css";

const ingredientsList = [
  "Tomate",
  "Mozzarella",
  "Basilic",
  "Oeuf",
  "Lardon",
  "Pâtes",
  "Pain",
  "Oignon",
  "Bouillon",
  "Parmesan"
];

function Lab() {
  const [grid, setGrid] = useState(Array(9).fill(null));
  const [message, setMessage] = useState("");
  const [recipes, setRecipes] = useState([]);

  const token = localStorage.getItem("token");

  // Drag start
  const handleDragStart = (ingredient) => {
    window.draggedIngredient = ingredient;
  };

  // Drop into a cell
  const handleDrop = (index) => {
    const newGrid = [...grid];
    newGrid[index] = window.draggedIngredient;
    setGrid(newGrid);
  };

  const allowDrop = (e) => e.preventDefault();

  // Tester recette
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
    } catch (err) {
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

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="lab-container">
      <h2>🧪 Laboratoire</h2>

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