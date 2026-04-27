import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import './ChessBoard.css';

const ChessBoard = ({ board, onMove, playerColor, legalMoves = [] }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const squareToCoords = (square) => {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(square[1], 10);
    return { file, rank };
  };

  const coordsToSquare = (file, rank) => {
    return String.fromCharCode('a'.charCodeAt(0) + file) + (8 - rank);
  };

  const getPieceFromFEN = (fen, square) => {
    const chessBoard = new Chess(fen).board();
    const { file, rank } = squareToCoords(square);
    return chessBoard[rank][file];
  };

  useEffect(() => {
    if (!selectedSquare) {
      setHighlightedSquares([]);
      return;
    }

    const possibleMoves = legalMoves.filter((move) => move.startsWith(selectedSquare));

    if (possibleMoves.length === 0) {
      setSelectedSquare(null);
      setHighlightedSquares([]);
      return;
    }

    setHighlightedSquares(possibleMoves.map((move) => move.substring(2, 4)));
  }, [board, legalMoves, selectedSquare]);

  const handleSquareClick = (file, rank) => {
    const square = coordsToSquare(file, rank);
    const piece = getPieceFromFEN(board, square);
    const currentPlayerPieceColor = playerColor === 'white' ? 'w' : 'b';

    if (selectedSquare) {
      const moveUCI = selectedSquare + square;

      if (legalMoves.includes(moveUCI)) {
        onMove(moveUCI);
        setSelectedSquare(null);
        setHighlightedSquares([]);
      } else if (piece && piece.color === currentPlayerPieceColor) {
        const possibleMoves = legalMoves.filter((move) => move.startsWith(square));
        setSelectedSquare(square);
        setHighlightedSquares(possibleMoves.map((move) => move.substring(2, 4)));
      } else {
        setSelectedSquare(null);
        setHighlightedSquares([]);
      }
    } else if (piece && piece.color === currentPlayerPieceColor) {
      const possibleMoves = legalMoves.filter((move) => move.startsWith(square));
      setSelectedSquare(square);
      setHighlightedSquares(possibleMoves.map((move) => move.substring(2, 4)));
    }
  };

  const getUnicode = (piece) => {
    if (!piece) return '';

    const unicodes = {
      K: '\u2654',
      Q: '\u2655',
      R: '\u2656',
      B: '\u2657',
      N: '\u2658',
      P: '\u2659',
      k: '\u265A',
      q: '\u265B',
      r: '\u265C',
      b: '\u265D',
      n: '\u265E',
      p: '\u265F'
    };

    const pieceCode = piece.color === 'w'
      ? piece.type.toUpperCase()
      : piece.type.toLowerCase();

    return unicodes[pieceCode] || '';
  };

  const renderSquare = (file, rank) => {
    const square = coordsToSquare(file, rank);
    const isLight = (file + rank) % 2 === 0;
    const isSelected = selectedSquare === square;
    const isHighlighted = highlightedSquares.includes(square);
    const piece = getPieceFromFEN(board, square);

    return (
      <div
        key={`${file}-${rank}`}
        className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
        onClick={() => handleSquareClick(file, rank)}
      >
        {piece && (
          <span className={`piece ${piece.color === 'w' ? 'white' : 'black'}`}>
            {getUnicode(piece)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="chessboard-container">
      <div className="chessboard">
        {playerColor === 'black' ? (
          <>
            {ranks.map((rank, i) => files.map((file, j) => renderSquare(7 - j, i)))}
          </>
        ) : (
          <>
            {ranks.map((rank, i) => files.map((file, j) => renderSquare(j, 7 - i)))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
