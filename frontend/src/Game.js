import React, { useState, useEffect } from 'react';
import ChessBoard from './ChessBoard';
import ChessWebSocketClient from './ChessWebSocketClient';
import './Game.css';

const Game = ({ gameId, playerName, opponentName, playerColor = 'white' }) => {
  const [board, setBoard] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [legalMoves, setLegalMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [gameStatus, setGameStatus] = useState('active');
  const [moveHistory, setMoveHistory] = useState([]);
  const [chat, setChat] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [wsClient, setWsClient] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Connecting...');

  useEffect(() => {
    const client = new ChessWebSocketClient(gameId, playerName, handleWebSocketMessage);
    setWsClient(client);

    client.connect()
      .then(() => {
        setStatusMessage('Connected! Waiting for game to start...');
        // Request board state in case game already started
        setTimeout(() => {
          client.requestBoard();
        }, 500);
        client.startGame(opponentName);
      })
      .catch(error => {
        setStatusMessage('Connection failed: ' + error.message);
      });

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [gameId, playerName, opponentName]);

  const handleWebSocketMessage = (message) => {
    const { type } = message;

    switch (type) {
      case 'welcome':
        console.log('Welcome message:', message);
        break;

      case 'player_joined':
        addChatMessage('System', `${message.player_name} joined the game`);
        break;

      case 'game_started':
        setGameStarted(true);
        const boardFen = message.board.fen || message.board;
        setBoard(boardFen);
        setLegalMoves(message.board.legal_moves || []);
        setCurrentTurn(message.board.turn || 'white');
        setMoveHistory(message.board.move_history || []);
        addChatMessage('System', 'Game started!');
        setStatusMessage(`Game started! Your color: ${playerColor}`);
        break;

      case 'move_made':
        const boardFenMove = message.board.fen || message.board;
        setBoard(boardFenMove);
        setLegalMoves(message.board.legal_moves || []);
        setCurrentTurn(message.board.turn || 'white');
        setMoveHistory([...moveHistory, message.move]);
        addChatMessage('System', `${message.player} moved ${message.move}`);
        break;

      case 'game_over':
        setGameStatus('finished');
        const result = message.result;
        if (result.winner) {
          addChatMessage('System', `Game Over! ${result.winner} won by ${result.reason}`);
        } else {
          addChatMessage('System', `Game Over! Draw by ${result.reason}`);
        }
        break;

      case 'chat':
        addChatMessage(message.player, message.message);
        break;

      case 'move_error':
        addChatMessage('Error', message.error);
        break;

      case 'board_update':
        const boardFenUpdate = message.board.fen || message.board;
        setBoard(boardFenUpdate);
        setLegalMoves(message.board.legal_moves || []);
        setCurrentTurn(message.board.turn || 'white');
        if (!gameStarted) {
          setGameStarted(true);
          addChatMessage('System', 'Synced with game in progress!');
          setStatusMessage(`Game synced! Your color: ${playerColor}`);
        }
        break;

      default:
        console.log('Unknown message type:', type);
    }
  };

  const addChatMessage = (player, message) => {
    setChat(prev => [...prev, { player, message, timestamp: new Date() }]);
  };

  const handleMove = (move) => {
    if (currentTurn !== playerColor) {
      addChatMessage('Error', 'It\'s not your turn!');
      return;
    }

    if (wsClient) {
      wsClient.makeMove(move);
    }
  };

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign?')) {
      if (wsClient) {
        wsClient.resign();
      }
    }
  };

  const handleChatSend = () => {
    if (chatMessage.trim() && wsClient) {
      wsClient.sendChat(chatMessage);
      setChatMessage('');
    }
  };

  const getMoveNotation = () => {
    return moveHistory.map((move, idx) => {
      if (idx % 2 === 0) {
        return `${Math.floor(idx / 2) + 1}. ${move}`;
      } else {
        return move;
      }
    }).join(' ');
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Chess Multiplayer</h1>
        <p className="status">{statusMessage}</p>
      </div>

      {gameStarted ? (
        <div className="game-content">
          <div className="main-board">
            <div className="player-info white-info">
              <span className="color-badge white">White</span>
              <span className="player-name">{playerColor === 'white' ? 'You' : opponentName}</span>
            </div>
            <ChessBoard
              board={board}
              onMove={handleMove}
              playerColor={playerColor}
              legalMoves={legalMoves}
            />
            <div className="player-info black-info">
              <span className="color-badge black">Black</span>
              <span className="player-name">{playerColor === 'black' ? 'You' : opponentName}</span>
            </div>
          </div>

          <div className="sidebar">
            <div className="game-info">
              <h3>Game Info</h3>
              <p><strong>Current Turn:</strong> {currentTurn.toUpperCase()}</p>
              <p><strong>Status:</strong> {gameStatus}</p>
              <p><strong>Moves:</strong> {moveHistory.length}</p>
              <button onClick={handleResign} className="resign-btn">Resign</button>
            </div>

            <div className="moves-section">
              <h3>Move History</h3>
              <div className="moves-list">
                {getMoveNotation()}
              </div>
            </div>

            <div className="chat-section">
              <h3>Chat</h3>
              <div className="chat-messages">
                {chat.map((msg, idx) => (
                  <div key={idx} className="chat-message">
                    <strong>{msg.player}:</strong> {msg.message}
                  </div>
                ))}
              </div>
              <div className="chat-input-group">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Type message..."
                  className="chat-input"
                />
                <button onClick={handleChatSend} className="send-btn">Send</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Waiting for opponent...</p>
        </div>
      )}
    </div>
  );
};

export default Game;
