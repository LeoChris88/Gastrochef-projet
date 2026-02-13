function IngredientsBar({ ingredients }) {
  const handleDragStart = (ingredient) => {
    window.draggedIngredient = ingredient;
  };

  return (
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
  );
}

export default IngredientsBar;