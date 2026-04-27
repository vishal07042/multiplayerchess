import React, { useState } from 'react';
import Lobby from './Lobby';
import Game from './Game';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);

  const handleGameStart = (config) => {
    setGameState({
      playerName: config.playerName,
      opponentName: config.opponentName,
      gameId: config.gameId,
      playerColor: config.playerColor
    });
  };

  const handleBackToLobby = () => {
    setGameState(null);
  };

  return (
    <div className="app">
      {!gameState ? (
        <Lobby onGameStart={handleGameStart} />
      ) : (
        <>
          <button className="back-button" onClick={handleBackToLobby}>← Back to Lobby</button>
          <Game
            gameId={gameState.gameId}
            playerName={gameState.playerName}
            opponentName={gameState.opponentName}
            playerColor={gameState.playerColor}
          />
        </>
      )}
    </div>
  );
}

export default App;
