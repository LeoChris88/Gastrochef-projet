import { useState, useEffect } from "react";
import axios from "axios";

function Lab() {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [message, setMessage] = useState("");
  const [recipes, setRecipes] = useState([]);

  // Liste d’ingrédients dispo (MVP = en dur côté front)
  const ingredients = ["Tomate", "Fromage", "Pâte", "Poulet", "Salade"];

  const token = localStorage.getItem("token");

  // Ajouter un ingrédient à la combinaison
  const addIngredient = (ingredient) => {
    setSelectedIngredients([...selectedIngredients, ingredient]);
  };

  // Tester la recette
  const testRecipe = async () => {
    if (selectedIngredients.length === 0) {
      setMessage("Ajoute au moins un ingrédient !");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/lab/test",
        { ingredients: selectedIngredients },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setSelectedIngredients([]);
      fetchRecipes(); // refresh livre de recettes
    } catch (err) {
      setMessage("❌ Erreur pendant le test");
      console.error(err);
    }
  };

  // Récupérer recettes découvertes
  const fetchRecipes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/recipes/my",
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