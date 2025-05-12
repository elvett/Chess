"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Board } from "./api/chess/board";
import { Cell } from "./api/chess/Cell";
import { Player } from "./api/chess/Player";
import { Color } from "./api/chess/Color";
import { FigureName } from "./api/chess/Figure";
import Timer from "./components/chess/timer";
import { GameLogic } from "./api/chess/GameLogic";
import PromotionModal from "./components/chess/promotion";

const App: React.FC = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Cell[]>([]);
  const [attackMoves, setAttackMoves] = useState<Cell[]>([]);
  const [whitePlayer] = useState(new Player(Color.White));
  const [blackPlayer] = useState(new Player(Color.Black));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(whitePlayer);
  const [gameLogic, setGameLogic] = useState<GameLogic | null>(null);
  const [winner, setWinner] = useState<Color | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [turn, setTurn] = useState(0);
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [promotionFromCell, setPromotionFromCell] = useState<Cell | null>(null);
  const [promotionToCell, setPromotionToCell] = useState<Cell | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isViewingHistory, setIsViewingHistory] = useState(false);

  useEffect(() => {
    restart();
  }, []);

  const restart = useCallback(() => {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    const newGameLogic = new GameLogic(newBoard);
    newGameLogic.promptPromotion = (from, to) => {
      setPromotionFromCell(from);
      setPromotionToCell(to);
      setPromotionModalVisible(true);
    };
    setGameLogic(newGameLogic);
    setSelectedCell(null);
    setAvailableMoves([]);
    setAttackMoves([]);
    setCurrentPlayer(whitePlayer);
    setWinner(null);
    setTurn(0);
    setHistory([]);
    setPromotionModalVisible(false);
    setIsViewingHistory(false);
  }, [whitePlayer]);

  const swapPlayer = useCallback(() => {
    setTurn((prevTurn) => prevTurn + 0.5);
    setCurrentPlayer((prev) => (prev === whitePlayer ? blackPlayer : whitePlayer));
  }, [whitePlayer, blackPlayer]);

  const handleCellClick = useCallback(
    (cell: Cell) => {
      if (!board || !gameLogic || winner || isDraw || isViewingHistory) return;

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

      if (selectedCell.figure) {
        const moveSuccessful = gameLogic.moveFigure(selectedCell, cell);
        if (moveSuccessful) {
          if (!promotionModalVisible) {
            setSelectedCell(null);
            setAvailableMoves([]);
            setAttackMoves([]);

            const updatedBoard = new Board();
            updatedBoard.cells = board.cells;
            setBoard(updatedBoard);
            const newLogic = new GameLogic(updatedBoard);
            newLogic.promptPromotion = gameLogic.promptPromotion;
            setGameLogic(newLogic);

            const opponentColor = currentPlayer.color === Color.White ? Color.Black : Color.White;
            const isMate = newLogic.isCheckmate(opponentColor);
            const isStalemate = newLogic.isStalemate(opponentColor);
            const isThreefold = newLogic.isThreefoldRepetition();

            if (isMate) {
              setWinner(currentPlayer.color);
              return;
            }

            if (isStalemate || isThreefold) {
              setIsDraw(true);
              return;
            }

            const fen = board.generateFEN(currentPlayer, turn);
            setHistory((prevHistory) => [...prevHistory, fen]);
            swapPlayer();
          }
        }
      } else {
        selectCell(cell);
      }
    },
    [board, currentPlayer, selectedCell, swapPlayer, gameLogic, winner, isDraw, promotionModalVisible, isViewingHistory]
  );

  const selectCell = useCallback(
    (cell: Cell) => {
      if (!board || !currentPlayer || !gameLogic || isViewingHistory) return;

      if (cell.figure && cell.figure.color === currentPlayer.color) {
        const moves = board.cells.flat().filter((target) => gameLogic.canReallyMove(cell, target));
        const attacks = moves.filter((move) => move.figure !== null);
        setAvailableMoves(moves);
        setAttackMoves(attacks);
        setSelectedCell(cell);
      } else {
        setSelectedCell(null);
        setAvailableMoves([]);
        setAttackMoves([]);
      }
    },
    [board, currentPlayer, gameLogic, isViewingHistory]
  );

  const handlePromotionSelect = useCallback(
    (figure: FigureName) => {
      if (!promotionFromCell || !promotionToCell || !gameLogic) return;

      gameLogic.promotion(promotionFromCell, promotionToCell, figure);
      setPromotionModalVisible(false);

      const updatedBoard = new Board();
      updatedBoard.cells = board!.cells;
      setBoard(updatedBoard);
      const newLogic = new GameLogic(updatedBoard);
      newLogic.promptPromotion = gameLogic.promptPromotion;
      setGameLogic(newLogic);

      setSelectedCell(null);
      setAvailableMoves([]);
      setAttackMoves([]);

      const opponentColor = currentPlayer.color === Color.White ? Color.Black : Color.White;
      const isMate = newLogic.isCheckmate(opponentColor);
      if (isMate) {
        setWinner(currentPlayer.color);
      }
    },
    [promotionFromCell, promotionToCell, gameLogic, board, currentPlayer]
  );

  const handleTimeout = useCallback((loserColor: Color) => {
    setWinner(loserColor === Color.White ? Color.Black : Color.White);
  }, []);

  const handleHistoryClick = useCallback(
    (fen: string, index: number) => {
      const newBoard = new Board();
      newBoard.loadFromFEN(fen);
      setBoard(newBoard);

      const newGameLogic = new GameLogic(newBoard);
      setGameLogic(newGameLogic);
      setSelectedCell(null);
      setAvailableMoves([]);
      setAttackMoves([]);
     
      if (index === history.length - 1) {
        setIsViewingHistory(false);
             setCurrentPlayer(history.length % 2 === 0 ? whitePlayer : blackPlayer);
        setTurn(Math.floor(history.length / 2));
      } else {
        setIsViewingHistory(true);
      }
    },
    [history, whitePlayer, blackPlayer]
  );

  if (!board) return <div className="loading">Loading chess game...</div>;

  const cellSize = 84 * 1.4;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #2c3e50, #1a252f)",
        padding: "20px",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Chess Board */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h1
          style={{
            fontFamily: "'Segoe UI', sans-serif",
            color: "#ecf0f1",
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            marginBottom: "15px",
          }}
        >
          Chess Game
        </h1>
        {winner && (
          <h2
            style={{
              color: "#e74c3c",
              backgroundColor: "#2c3e50",
              padding: "10px 20px",
              borderRadius: "15px",
              marginBottom: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            {winner === Color.White ? "White" : "Black"} wins!
          </h2>
        )}
        {isDraw && (
          <h2
            style={{
              color: "#f1c40f",
              backgroundColor: "#2c3e50",
              padding: "10px 20px",
              borderRadius: "15px",
              marginBottom: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            Game ended in a draw!
          </h2>
        )}
        {!winner && !isDraw && (
          <h2
            style={{
              color: "#ecf0f1",
              backgroundColor: "#34495e",
              padding: "8px 16px",
              borderRadius: "20px",
              margin: 0,
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            Turn: {currentPlayer.color === Color.White ? "White" : "Black"} {turn}
          </h2>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(8, ${cellSize}px)`,
            gap: "2px",
            border: "4px solid #34495e",
            padding: "4px",
            backgroundColor: "#7f8c8d",
            borderRadius: "8px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
          }}
        >
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
                    border: selectedCell === cell ? "4px solid #f1c40f" : "1px solid #2c3e50",
                    cursor: isViewingHistory ? "default" : "pointer",
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
                        transition: "transform 0.2s ease",
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
      <div
        style={{
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
        }}
      >
        <Timer currentPlayer={currentPlayer} restart={restart} winner={winner} onTimeout={handleTimeout} />
      </div>
      {/* Promotion Modal */}
      <PromotionModal
        visible={promotionModalVisible}
        color={currentPlayer.color}
        onSelect={handlePromotionSelect}
      />
      

      <div
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          backgroundColor: "#34495e",
          padding: "10px 20px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          maxHeight: "80%",
          overflowY: "auto",
          color: "#ecf0f1",
          width: "300px",
        }}
      >
        <h3 style={{ marginBottom: "10px", textAlign: "center" }}>Move History (FEN)</h3>
        <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
          {history.map((fen, index) => (
            <li
              key={index}
              onClick={() => handleHistoryClick(fen, index)}
              style={{
                padding: "5px",
                cursor: "pointer",
                borderBottom: "1px solid #7f8c8d",
                color: "#ecf0f1",
                fontSize: "14px",
                backgroundColor: index === history.length - 1 && !isViewingHistory ? "#2ecc71" : "transparent", 
              }}
            >
              {fen}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;