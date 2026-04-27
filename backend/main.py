from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import uuid
from typing import Dict
import logging

from connection_manager import ConnectionManager
from game_logic import ChessGame

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Chess Multiplayer API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize connection manager
manager = ConnectionManager()

# Store active games
games: Dict[str, ChessGame] = {}

# Store player info
player_sessions: Dict[str, dict] = {}


@app.get("/")
async def root():
    return {"message": "Chess Multiplayer Server", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/create-game")
async def create_game(player_name: str):
    """Create a new game room"""
    game_id = str(uuid.uuid4())[:8]
    room_data = {
        "game_id": game_id,
        "player1": player_name,
        "player2": None,
        "status": "waiting"
    }
    return JSONResponse(content=room_data)


@app.post("/join-game")
async def join_game(game_id: str, player_name: str):
    """Join an existing game"""
    return JSONResponse(content={
        "message": f"Player {player_name} joined game {game_id}",
        "game_id": game_id
    })


@app.websocket("/ws/{room_id}/{player_name}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_name: str):
    """
    WebSocket endpoint for game communication
    - room_id: unique game room identifier
    - player_name: name of the player
    """
    player_id = str(uuid.uuid4())
    
    try:
        # Accept the connection
        connection_count = await manager.connect(websocket, room_id)
        logger.info(f"Player {player_name} connected to room {room_id}. Total: {connection_count}")
        
        # Store player session
        player_sessions[player_id] = {
            "player_name": player_name,
            "room_id": room_id,
            "websocket": websocket
        }
        
        # Notify others about the new player
        await manager.broadcast({
            "type": "player_joined",
            "player_name": player_name,
            "room_players": manager.get_room_players(room_id),
            "total_players": manager.get_room_size(room_id)
        }, room_id)
        
        # Send welcome message
        await manager.send_personal({
            "type": "welcome",
            "player_id": player_id,
            "player_name": player_name,
            "room_id": room_id
        }, websocket)
        
        # If there's an active game, send current board state to the joining player
        if room_id in games:
            game = games[room_id]
            await manager.send_personal({
                "type": "game_started",
                "game_id": room_id,
                "player1": game.player1,
                "player2": game.player2,
                "board": game.get_board_state()
            }, websocket)
        
        # Listen for messages
        while True:
            data = await websocket.receive_json()
            await handle_message(data, player_id, room_id, player_name, websocket)
    
    except WebSocketDisconnect:
        logger.info(f"Player {player_name} disconnected from room {room_id}")
        manager.disconnect(websocket, room_id)
        
        # Notify others
        await manager.broadcast({
            "type": "player_left",
            "player_name": player_name,
            "total_players": manager.get_room_size(room_id)
        }, room_id)
        
        # Clean up session
        if player_id in player_sessions:
            del player_sessions[player_id]
    
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
        manager.disconnect(websocket, room_id)


async def handle_message(data: dict, player_id: str, room_id: str, player_name: str, websocket: WebSocket):
    """Handle incoming WebSocket messages"""
    message_type = data.get("type")
    
    if message_type == "start_game":
        # Initialize a new game
        player2_name = data.get("opponent_name", "Opponent")
        
        if room_id not in games:
            game = ChessGame(room_id, player_name, player2_name)
            games[room_id] = game
            
            # Send initial board state to both players
            await manager.broadcast({
                "type": "game_started",
                "game_id": room_id,
                "player1": player_name,
                "player2": player2_name,
                "board": game.get_board_state()
            }, room_id)
    
    elif message_type == "move":
        # Handle a chess move
        if room_id in games:
            game = games[room_id]
            move = data.get("move")
            
            result = game.make_move(move, player_name)
            
            if result["success"]:
                # Broadcast the move to all players
                await manager.broadcast({
                    "type": "move_made",
                    "move": move,
                    "player": player_name,
                    "board": game.get_board_state(),
                    "game_status": game.game_status
                }, room_id)
                
                # Check for game over
                if game.board.is_game_over():
                    game_result = game.get_game_result()
                    await manager.broadcast({
                        "type": "game_over",
                        "result": game_result
                    }, room_id)
            else:
                # Send error to the player
                await manager.send_personal({
                    "type": "move_error",
                    "error": result.get("error"),
                    "current_turn": result.get("current_turn")
                }, websocket)
    
    elif message_type == "resign":
        # Player resigns
        if room_id in games:
            game = games[room_id]
            result = game.resign(player_name)
            
            await manager.broadcast({
                "type": "game_over",
                "result": result
            }, room_id)
            
            # Clean up the game
            del games[room_id]
    
    elif message_type == "chat":
        # Broadcast chat message
        message = data.get("message", "")
        await manager.broadcast({
            "type": "chat",
            "player": player_name,
            "message": message
        }, room_id)
    
    elif message_type == "request_board":
        # Send current board state
        if room_id in games:
            game = games[room_id]
            await manager.send_personal({
                "type": "board_update",
                "board": game.get_board_state()
            }, websocket)
    
    else:
        logger.warning(f"Unknown message type: {message_type}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
