import chess
import json
from typing import Optional

class ChessGame:
    def __init__(self, game_id: str, player1: str, player2: str):
        self.game_id = game_id
        self.board = chess.Board()
        self.player1 = player1
        self.player2 = player2
        self.current_turn = "white"  # white starts
        self.game_status = "active"  # active, checkmate, stalemate, draw
        self.move_history = []
        self.player_colors = {
            player1: "white",
            player2: "black"
        }
    
    def get_board_fen(self) -> str:
        """Get the current board state in FEN notation"""
        return self.board.fen()
    
    def get_board_state(self) -> dict:
        """Get the full board state"""
        return {
            "fen": self.board.fen(),
            "turn": "white" if self.board.turn else "black",
            "check": self.board.is_check(),
            "checkmate": self.board.is_checkmate(),
            "stalemate": self.board.is_stalemate(),
            "game_over": self.board.is_game_over(),
            "legal_moves": [move.uci() for move in self.board.legal_moves],
            "move_history": self.move_history
        }
    
    def make_move(self, move_uci: str, player: str) -> dict:
        """
        Make a move on the board
        move_uci format: "e2e4" (from square to square)
        """
        try:
            # Verify it's the player's turn
            expected_color = self.player_colors.get(player)
            current_color = "white" if self.board.turn else "black"
            
            if expected_color != current_color:
                return {
                    "success": False,
                    "error": f"It's not {player}'s turn",
                    "current_turn": current_color
                }
            
            # Parse and validate the move
            move = chess.Move.from_uci(move_uci)
            
            if move not in self.board.legal_moves:
                return {
                    "success": False,
                    "error": "Illegal move"
                }
            
            # Make the move
            self.board.push(move)
            self.move_history.append(move_uci)
            
            # Update game status
            if self.board.is_checkmate():
                self.game_status = "checkmate"
            elif self.board.is_stalemate():
                self.game_status = "stalemate"
            elif self.board.is_game_over():
                self.game_status = "draw"
            
            return {
                "success": True,
                "move": move_uci,
                "board": self.get_board_state()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def resign(self, player: str) -> dict:
        """Player resigns from the game"""
        self.game_status = "resigned"
        winner = self.player2 if player == self.player1 else self.player1
        return {
            "game_over": True,
            "reason": "resignation",
            "winner": winner
        }
    
    def get_game_result(self) -> Optional[dict]:
        """Get the game result if game is over"""
        if not self.board.is_game_over():
            return None
        
        result = {
            "game_over": True,
            "reason": self.game_status
        }
        
        if self.board.is_checkmate():
            # Current player is checkmated, so other player wins
            winner = self.player2 if self.board.turn else self.player1
            result["winner"] = winner
            result["reason"] = "checkmate"
        elif self.board.is_stalemate():
            result["winner"] = None
            result["reason"] = "stalemate"
        
        return result
