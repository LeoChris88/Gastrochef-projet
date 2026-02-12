import { useState, useEffect } from "react";
import axios from "axios";

function Lab() {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [message, setMessage] = useState("");
  const [recipes, setRecipes] = useState([]);

  // ⚠️ Doivent correspondre EXACTEMENT aux noms en base
  const ingredients = [
    "tomate",
    "mozzarella",
    "basilic",
    "oeuf",
    "sel",
    "poivre",
    "pâtes",
    "lardons",
    "parmesan",
    "pain",
    "ail",
    "huile d'olive",
    "oignon",
    "bouillon",
    "gruyère"
  ];

  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const addIngredient = (ingredient) => {
    setSelectedIngredients([...selectedIngredients, ingredient]);
  };

  // 🧪 TESTER RECETTE
  const testRecipe = async () => {
    if (selectedIngredients.length === 0) {
      setMessage("Ajoute au moins un ingrédient !");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/recipes/test",
        { ingredients: selectedIngredients },
        config
      );

      setMessage(res.data.message);
      setSelectedIngredients([]);
      fetchRecipes();
    } catch (err) {
      console.error(err.response?.data);
      setMessage(err.response?.data?.message || "❌ Erreur pendant le test");
    }
  };

  // 📖 RECETTES DÉCOUVERTES
  const fetchRecipes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/recipes/discovered",
        config
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
    <div style={{ padding: "20px" }}>
      <h2>🧪 Laboratoire</h2>

      <h3>🥕 Ingrédients disponibles</h3>
      {ingredients.map((ing) => (
        <button
          key={ing}
          onClick={() => addIngredient(ing)}
          style={{ margin: "5px" }}
        >
          {ing}
        </button>
      ))}

      <h3>🧺 Ta combinaison</h3>
      <p>
        {selectedIngredients.length > 0
          ? selectedIngredients.join(" + ")
          : "Aucun ingrédient sélectionné"}
      </p>

      <button onClick={testRecipe} style={{ marginTop: "10px" }}>
        Tester la recette
      </button>

      <h3 style={{ marginTop: "20px" }}>{message}</h3>

      <hr />

      <h3>📖 Recettes découvertes</h3>
      {recipes.length === 0 ? (
        <p>Aucune recette découverte pour l’instant</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe._id}>{recipe.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Lab;