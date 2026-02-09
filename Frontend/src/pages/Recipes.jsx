import { useEffect, useState } from "react";
import API from "../services/api";

function Recipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    API.get("/recipes/discovered").then((res) => setRecipes(res.data));
  }, []);

  return (
    <div>
      <h2>📚 Recettes découvertes</h2>
      {recipes.map((r) => (
        <div key={r._id}>
          <h3>{r.name}</h3>
          <p>{r.ingredients.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

export default Recipes;