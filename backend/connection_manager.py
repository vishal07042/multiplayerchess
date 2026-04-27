from typing import List, Set
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.game_rooms: dict = {}
    
    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.game_rooms:
            self.game_rooms[room_id] = {
                "connections": [],
                "players": []
            }
        self.game_rooms[room_id]["connections"].append(websocket)
        self.active_connections.append(websocket)
        return len(self.game_rooms[room_id]["connections"])
    
    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.game_rooms:
            if websocket in self.game_rooms[room_id]["connections"]:
                self.game_rooms[room_id]["connections"].remove(websocket)
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict, room_id: str):
        if room_id in self.game_rooms:
            for connection in self.game_rooms[room_id]["connections"]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting message: {e}")
    
    async def send_personal(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
    
    def get_room_players(self, room_id: str):
        if room_id in self.game_rooms:
            return self.game_rooms[room_id]["players"]
        return []
    
    def add_player(self, room_id: str, player_name: str):
        if room_id in self.game_rooms:
            self.game_rooms[room_id]["players"].append(player_name)
    
    def get_room_size(self, room_id: str):
        if room_id in self.game_rooms:
            return len(self.game_rooms[room_id]["connections"])
        return 0
