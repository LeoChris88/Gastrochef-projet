function GameOver({ onRestart }) {
  return (
    <div className="game-over-container">
      <h1>💀 Game Over</h1>
      <p>La satisfaction des clients est tombée à 0.</p>
      <button className="restart-btn" onClick={onRestart}>
        Rejouer
      </button>
    </div>
  );
}

export default GameOver;