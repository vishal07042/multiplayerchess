import React, { useState } from 'react';
import './Lobby.css';

const Lobby = ({ onGameStart }) => {
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [gameMode, setGameMode] = useState('create'); // 'create' or 'join'
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const [generatedGameId, setGeneratedGameId] = useState('');

  const handleStartGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!opponentName.trim()) {
      setError('Please enter opponent name');
      return;
    }

    if (gameMode === 'join' && !gameId.trim()) {
      setError('Please enter game ID');
      return;
    }

    // Generate game ID if creating new game
    if (gameMode === 'create' && !generatedGameId) {
      const newGameId = Math.random().toString(36).substring(2, 9).toUpperCase();
      setGeneratedGameId(newGameId);
      setError(''); // Clear any previous errors
      return;
    }

    // Use generated ID for create, or user-provided ID for join
    const finalGameId = gameMode === 'create' ? generatedGameId : gameId;

    onGameStart({
      playerName,
      opponentName,
      gameId: finalGameId,
      playerColor: gameMode === 'create' ? 'white' : 'black'
    });
  };

  return (
    <div className="lobby-container">
      <div className="lobby-content">
        <div className="lobby-header">
          <h1>♟ Chess Multiplayer ♟</h1>
          <p>Play chess with friends online in real-time</p>
        </div>

        <div className="lobby-card">
          <div className="tabs">
            <button
              className={`tab ${gameMode === 'create' ? 'active' : ''}`}
              onClick={() => setGameMode('create')}
            >
              Create Game
            </button>
            <button
              className={`tab ${gameMode === 'join' ? 'active' : ''}`}
              onClick={() => setGameMode('join')}
            >
              Join Game
            </button>
          </div>

          {gameMode === 'create' && generatedGameId && (
            <div className="game-id-box">
              <h3>✓ Game Created!</h3>
              <p className="game-id-label">Share this Game ID with your friend:</p>
              <div className="game-id-display">
                <code>{generatedGameId}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedGameId);
                    alert('Game ID copied to clipboard!');
                  }}
                  className="copy-btn"
                >
                  Copy
                </button>
              </div>
              <button className="start-button" onClick={handleStartGame}>
                Start Game
              </button>
              <button 
                className="create-another-btn"
                onClick={() => {
                  setGeneratedGameId('');
                  setPlayerName('');
                  setOpponentName('');
                  setError('');
                }}
              >
                Create Another Game
              </button>
            </div>
          )}

          {gameMode === 'create' && !generatedGameId && (
            <>
              <div className="form-group">
                <label htmlFor="playerName">Your Name</label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="opponentName">Opponent Name</label>
                <input
                  id="opponentName"
                  type="text"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  placeholder="Enter opponent name"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
                />
              </div>

              <div className="info-box">
                <p>You will play as <strong>White</strong> and go first.</p>
                <p>Share the game ID with your friend to let them join.</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button className="start-button" onClick={handleStartGame}>
                Create Game & Get ID
              </button>
            </>
          )}

          {gameMode === 'join' && (
            <>
              <div className="form-group">
                <label htmlFor="playerName">Your Name</label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="opponentName">Opponent Name</label>
                <input
                  id="opponentName"
                  type="text"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  placeholder="Enter opponent name"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gameId">Game ID</label>
                <input
                  id="gameId"
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value.toUpperCase())}
                  placeholder="Enter game ID to join"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
                />
              </div>

              <div className="info-box">
                <p>You will play as <strong>Black</strong>.</p>
                <p>Ask your friend for their game ID.</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button className="start-button" onClick={handleStartGame}>
                Join Game
              </button>
            </>
          )}
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🎮</span>
            <h3>Real-time Multiplayer</h3>
            <p>Play with friends instantly via WebSockets</p>
          </div>
          <div className="feature">
            <span className="feature-icon">♞</span>
            <h3>Full Chess Rules</h3>
            <p>Complete chess engine with legal move validation</p>
          </div>
          <div className="feature">
            <span className="feature-icon">💬</span>
            <h3>In-game Chat</h3>
            <p>Chat with your opponent during the game</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
