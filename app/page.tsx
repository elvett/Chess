"use client";
import { Board } from "./api/chess/board"; // Измените путь
import React, { useEffect, useState } from "react";
import { Cell } from "./api/chess/Cell";

const App = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  useEffect(() => {
    restart();
  }, []);

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setSelectedCell(null);
  }

  function handleCellClick(cell: Cell) {
    if (selectedCell && selectedCell !== cell) {
      // Если уже выбрана клетка с фигурой, пробуем сделать ход
      if (selectedCell.figure?.canMove(cell)) {
        selectedCell.move(cell); // Перемещаем фигуру
        setSelectedCell(null); // Сбрасываем выбор
        setBoard((prev) => (prev ? { ...prev } : null)); // Обновляем доску
      } else {
        setSelectedCell(cell); // Если ход невозможен, выбираем другую клетку
      }
    } else {
      setSelectedCell(cell); // Выбираем клетку (если фигура не выбрана)
    }
  }

  if (!board) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h1>Шахматная доска</h1>
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
          row.map((cell: Cell, cellIndex: number) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              onClick={() => handleCellClick(cell)}
              style={{
                width: "84px",
                height: "84px",
                backgroundColor: cell.color === "white" ? "white" : "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: selectedCell === cell ? "4px solid red" : "1px solid black",
                cursor: "pointer",
              }}
            >
              {cell.figure && cell.figure.logo && (
                <img
                  src={cell.figure.logo}
                  alt={cell.figure.name}
                  style={{ width: "60px", height: "60px" }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
