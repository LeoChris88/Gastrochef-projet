import { useState, useEffect } from "react";
import {
  fetchDiscoveredRecipes,
  testRecipeRequest,
} from "../services/recipeService";

export const useRecipes = (token) => {
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRecipes = async () => {
    const data = await fetchDiscoveredRecipes(token);
    setRecipes(data);
  };

  const testRecipe = async (ingredients, resetGrid) => {
    if (!ingredients.length) {
      setMessage("Ajoute des ingrédients !");
      return;
    }

    try {
      const res = await testRecipeRequest(ingredients, token);
      setMessage(res.message);
      resetGrid();
      fetchRecipes();
    } catch {
      setMessage("❌ Aucune recette trouvée");
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return { recipes, message, testRecipe, setMessage };
};