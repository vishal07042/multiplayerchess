/**
 * WebSocket client for chess game communication
 */

class ChessWebSocketClient {
  constructor(gameId, playerName, onMessageCallback) {
    this.gameId = gameId;
    this.playerName = playerName;
    this.onMessageCallback = onMessageCallback;
    this.ws = null;
    this.baseUrl = process.env.REACT_APP_API_URL || "ws://localhost:8000";
  }

  connect() {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.baseUrl}/ws/${this.gameId}/${this.playerName}`;
      
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.onMessageCallback(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  startGame(opponentName) {
    this.send({
      type: "start_game",
      opponent_name: opponentName
    });
  }

  makeMove(move) {
    this.send({
      type: "move",
      move: move
    });
  }

  resign() {
    this.send({
      type: "resign"
    });
  }

  sendChat(message) {
    this.send({
      type: "chat",
      message: message
    });
  }

  requestBoard() {
    this.send({
      type: "request_board"
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default ChessWebSocketClient;
