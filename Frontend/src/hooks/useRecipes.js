import { useState, useEffect } from "react";

export const useRecipes = (token) => {
  const [recipes, setRecipes] = useState([]); // ⬅️ [] au lieu de null
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchRecipes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/recipes/discovered", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setRecipes(Array.isArray(data) ? data : []); // ⬅️ Force le tableau
      } catch (error) {
        console.error("Erreur chargement recettes:", error);
        setRecipes([]); // ⬅️ Tableau vide en cas d'erreur
      }
    };

    fetchRecipes();
  }, [token]);

  const testRecipe = async (grid) => {
    try {
      const response = await fetch("http://localhost:5000/api/recipes/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ grid }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.discovered) {
        setRecipes((prev) => [...prev, data.recipe]);
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur test recette:", error);
      setMessage("❌ Erreur serveur");
    }
  };

  const clearRecipes = () => {
    setRecipes([]);
    setMessage("🗑️ Recettes effacées");
  };

  return {
    recipes,
    message,
    testRecipe,
    clearRecipes,
  };
};