"use client";
import { Board } from "./api/chess/board";
import React, { useEffect, useState } from "react";
import { Cell } from "./api/chess/Cell";
import { Player } from "./api/chess/Player";
import { Color } from "./api/chess/Color";

const App = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Cell[]>([]);
  const [attackMoves, setAttackMoves] = useState<Cell[]>([]);
  const [WhitePlayer] = useState(new Player(Color.White));
  const [BlackPlayer] = useState(new Player(Color.Black));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    restart();
    setCurrentPlayer(WhitePlayer);
  }, []);

  function swapPlayer() {
    setCurrentPlayer(prev =>
      prev?.color === Color.White ? BlackPlayer : WhitePlayer
    );
  }

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setSelectedCell(null);
    setAvailableMoves([]);
    setAttackMoves([]);
  }

  function handleCellClick(cell: Cell) {
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
      updatedBoard.cells = board!.cells;
      setBoard(updatedBoard);

      swapPlayer();
    } else {
      selectCell(cell);
    }
  }

  function selectCell(cell: Cell) {
    if (cell.figure && cell.figure.color === currentPlayer?.color) {
      const moves: Cell[] = board!.cells
        .flat()
        .filter((target) => cell.canReallyMove(target));
      const attacks = moves.filter((move) => move.figure !== null);
      setAvailableMoves(moves);
      setAttackMoves(attacks);
      setSelectedCell(cell);
    } else {
      setAvailableMoves([]);
      setAttackMoves([]);
      setSelectedCell(null);
    }
  }

  if (!board) return <div>Loading...</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Шахматная доска</h1>
      <h2>Ходит: {currentPlayer?.color === Color.White ? "Белые" : "Чёрные"}</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 84px)",
          gap: "2px",
          border: "4px solid black",
          padding: "4px",
          backgroundColor: "gray",
        }}
      >
        {board.cells.map((row: Cell[], rowIndex: number) =>
          row.map((cell: Cell, cellIndex: number) => {
            const isAvailableMove = availableMoves.includes(cell);
            const isAttackMove = attackMoves.includes(cell);
            return (
              <div
                key={`${rowIndex}-${cellIndex}`}
                onClick={() => handleCellClick(cell)}
                style={{
                  width: "84px",
                  height: "84px",
                  backgroundColor: isAttackMove
                    ? "red"
                    : isAvailableMove
                    ? "green"
                    : cell.color === "white"
                    ? "#fafafa"
                    : "#333333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border:
                    selectedCell === cell ? "4px solid yellow" : "1px solid black",
                  cursor: "pointer",
                }}
              >
                {cell.figure?.logo && (
                  <img
                    src={cell.figure.logo}
                    alt={cell.figure.name}
                    style={{ width: "60px", height: "60px" }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default App;
