"use client";
import { Board } from "./api/chess/board";
import React, { useEffect, useState, useCallback } from "react";
import { Cell } from "./api/chess/Cell";
import { Player } from "./api/chess/Player";
import { Color } from "./api/chess/Color";
import Timer from "./components/chess/timer";

const App: React.FC = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Cell[]>([]);
  const [attackMoves, setAttackMoves] = useState<Cell[]>([]);
  const [WhitePlayer] = useState(new Player(Color.White));
  const [BlackPlayer] = useState(new Player(Color.Black));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(WhitePlayer);

  useEffect(() => {
    restart();
  }, []);

  const swapPlayer = useCallback(() => {
    setCurrentPlayer(prev => prev === WhitePlayer ? BlackPlayer : WhitePlayer);
  }, [WhitePlayer, BlackPlayer]);

  const restart = useCallback(() => {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setSelectedCell(null);
    setAvailableMoves([]);
    setAttackMoves([]);
    setCurrentPlayer(WhitePlayer);
  }, [WhitePlayer]);

  const handleCellClick = useCallback((cell: Cell) => {
    if (!board || !currentPlayer) return;

    if (!selectedCell) {
      selectCell(cell);
      return;
    }

    if (selectedCell === cell) {
      setSelectedCell(null);
      setAvailableMoves([]);
      setAttackMoves([]);
      return;
    }

    if (selectedCell.canReallyMove(cell)) {
      selectedCell.move(cell);
      setSelectedCell(null);
      setAvailableMoves([]);
      setAttackMoves([]);
      const updatedBoard = new Board();
      updatedBoard.cells = board.cells;
      setBoard(updatedBoard);
      swapPlayer();
    } else {
      selectCell(cell);
    }
  }, [board, currentPlayer, selectedCell, swapPlayer]);

  const selectCell = useCallback((cell: Cell) => {
    if (!board || !currentPlayer) return;

    if (cell.figure && cell.figure.color === currentPlayer.color) {
      const moves = board.cells.flat().filter(target => cell.canReallyMove(target));
      const attacks = moves.filter(move => move.figure !== null);
      setAvailableMoves(moves);
      setAttackMoves(attacks);
      setSelectedCell(cell);
    } else {
      setSelectedCell(null);
      setAvailableMoves([]);
      setAttackMoves([]);
    }
  }, [board, currentPlayer]);

  if (!board) return <div className="loading">Loading chess game...</div>;

  const cellSize = 84 * 1.4;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #2c3e50, #1a252f)",
      padding: "20px",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    }}>
      {/* Chess Board */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        justifyContent: "center",
      }}>
        <h1 style={{
          fontFamily: "'Segoe UI', sans-serif",
          color: "#ecf0f1",
          textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
          marginBottom: "15px"
        }}>
          Chess Game
        </h1>
        <h2 style={{
          color: "#ecf0f1",
          backgroundColor: "#34495e",
          padding: "8px 16px",
          borderRadius: "20px",
          margin: 0,
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          marginBottom: "15px",
          textAlign: "center"
        }}>
          Turn: {currentPlayer.color === Color.White ? "White" : "Black"}
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(8, ${cellSize}px)`,
          gap: "2px",
          border: "4px solid #34495e",
          padding: "4px",
          backgroundColor: "#7f8c8d",
          borderRadius: "8px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        }}>
          {board.cells.map((row, rowIndex) =>
            row.map((cell, cellIndex) => {
              const isAvailableMove = availableMoves.includes(cell);
              const isAttackMove = attackMoves.includes(cell);
              return (
                <div
                  key={`${rowIndex}-${cellIndex}`}
                  onClick={() => handleCellClick(cell)}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: isAttackMove
                      ? "#e74c3c"
                      : isAvailableMove
                      ? "#2ecc71"
                      : cell.color === "white"
                      ? "#bdc3c7"
                      : "#34495e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: selectedCell === cell 
                      ? "4px solid #f1c40f" 
                      : "1px solid #2c3e50",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (isAvailableMove || isAttackMove) {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {cell.figure?.logo && (
                    <img
                      src={cell.figure.logo}
                      alt={cell.figure.name}
                      style={{ 
                        width: `${cellSize * 0.7}px`, 
                        height: `${cellSize * 0.7}px`,
                        transition: "transform 0.2s ease"
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Control Panel with Timer */}
      <div style={{
        position: "absolute",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "30px",
        backgroundColor: "#34495e",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        minWidth: "320px",
        maxWidth: "350px",
        height: "500px",
      }}>
        <Timer
          currentPlayer={currentPlayer}
          restart={restart}
        />
      </div>
    </div>
  );
};

export default App;
