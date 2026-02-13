import React from "react";

export default function CraftTable({
  grid,
  setGrid,
  ingredients,
  onTestRecipe,
}) {
  /* ================= DRAG ================= */

  const handleDragStart = (ingredient) => {
    window.draggedIngredient = ingredient;
  };

  const handleDrop = (index) => {
    const newGrid = [...grid];
    newGrid[index] = window.draggedIngredient;
    setGrid(newGrid);
  };

  const allowDrop = (e) => e.preventDefault();

  const clearGrid = () => {
    setGrid(Array(9).fill(null));
  };

  /* ================= UI ================= */

  return (
    <>
      <h3>🥕 Ingrédients</h3>
      <div className="ingredients-bar">
        {ingredients.map((ing) => (
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

      <div style={{ marginTop: "10px" }}>
        <button
          className="test-btn"
          onClick={() =>
            onTestRecipe(grid.filter(Boolean), clearGrid)
          }
        >
          Tester la recette
        </button>

        <button
          className="clear-btn"
          onClick={clearGrid}
          style={{ marginLeft: "10px" }}
        >
          Vider
        </button>
      </div>
    </>
  );
}