# Multiplayer Chess Game

A real-time multiplayer chess game built with **React** frontend and **FastAPI** backend, using **WebSockets** for real-time communication and **python-chess** for game logic.

## Features

- 🎮 Real-time multiplayer chess gameplay
- ♞ Full chess rules with legal move validation
- 💬 In-game chat system
- 🔄 Live board state synchronization
- 📱 Responsive design
- ♟ Move history tracking
- 🎨 Beautiful UI with gradient design

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **WebSockets** - Real-time bidirectional communication
- **python-chess** - Chess engine and move validation
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **chess.js** - Chess logic library
- **WebSocket API** - Client-side WebSocket communication
- **CSS3** - Styling

## Project Structure

```
chessmultiplayer/
├── backend/
│   ├── main.py                 # FastAPI application & WebSocket handlers
│   ├── connection_manager.py   # WebSocket connection management
│   ├── game_logic.py          # Chess game logic using python-chess
│   ├── requirements.txt        # Python dependencies
│   ├── .env                   # Environment variables
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main app component
│   │   ├── App.css
│   │   ├── Lobby.js           # Game lobby/setup
│   │   ├── Lobby.css
│   │   ├── Game.js            # Main game interface
│   │   ├── Game.css
│   │   ├── ChessBoard.js      # Chessboard component
│   │   ├── ChessBoard.css
│   │   ├── ChessWebSocketClient.js  # WebSocket client
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 14+ and npm (for frontend)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the server:
```bash
python main.py
```

The backend server will start at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## Usage

1. **Open the Game**: Go to `http://localhost:3000` in your browser

2. **Create a Game**:
   - Enter your name
   - Enter opponent's name
   - Click "Create & Start Game"
   - Share the generated Game ID with your opponent

3. **Join a Game**:
   - Click on "Join Game" tab
   - Enter your name and opponent's name
   - Enter the Game ID
   - Click "Join Game"

4. **Play**:
   - Click on pieces to select them
   - Click on highlighted squares to move
   - The green dots show legal moves
   - Use the chat box to communicate
   - Click "Resign" to forfeit

## API Endpoints

### REST Endpoints

- `GET /` - Server status
- `GET /health` - Health check
- `POST /create-game?player_name=<name>` - Create a new game room
- `POST /join-game?game_id=<id>&player_name=<name>` - Join a game

### WebSocket Endpoint

- `WS /ws/{room_id}/{player_name}` - Connect to game room

### WebSocket Message Types

**Client → Server:**
- `start_game` - Initialize game with opponent name
- `move` - Make a move (format: e2e4)
- `resign` - Resign from game
- `chat` - Send chat message
- `request_board` - Request current board state

**Server → Client:**
- `welcome` - Connection confirmation
- `player_joined` - New player joined
- `game_started` - Game initialization data
- `move_made` - Move was successful
- `game_over` - Game ended with result
- `chat` - Chat message from player
- `move_error` - Move was invalid
- `board_update` - Board state update

## Game Rules

The game implements standard chess rules including:
- Piece movement validation
- Check and checkmate detection
- Stalemate detection
- En passant
- Castling
- Pawn promotion
- Draw conditions

## Configuration

### Backend (.env)
```
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### Frontend (.env)
```
REACT_APP_API_URL=ws://localhost:8000
```

## Troubleshooting

### WebSocket Connection Errors
- Ensure backend is running on port 8000
- Check that the `REACT_APP_API_URL` in frontend `.env` is correct
- For deployment, update the WebSocket URL to your server's address

### Python Dependency Issues
- Make sure virtual environment is activated
- Try: `pip install --upgrade pip` then reinstall requirements

### Port Already in Use
- Backend: Change `API_PORT` in backend/.env and update frontend URL
- Frontend: Use `npm start -- --port 3001` or kill the process using port 3000

## Deployment

### Backend (FastAPI)
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

For production, consider using Gunicorn with Uvicorn workers:
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend (React)
```bash
npm run build
# Serve the build folder with any static host (Nginx, Vercel, Netlify, etc.)
```

## Future Enhancements

- [ ] AI opponent using Stockfish
- [ ] Game ratings and leaderboard
- [ ] Move time tracking
- [ ] Game replay/analysis
- [ ] User authentication
- [ ] Mobile app
- [ ] Puzzle mode
- [ ] Tournament system

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please create an issue in the repository.

---

**Enjoy your game! ♟️**
