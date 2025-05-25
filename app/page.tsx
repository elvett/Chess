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
import ChessAnalyzer from "./components/chess/ChessAnalyzer";
import axios from "axios";


const App: React.FC = () => {
  // Board state
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Cell[]>([]);
  const [attackMoves, setAttackMoves] = useState<Cell[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  // Game state
  const [whitePlayer] = useState(new Player(Color.White));
  const [blackPlayer] = useState(new Player(Color.Black));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(whitePlayer);
  const [gameLogic, setGameLogic] = useState<GameLogic | null>(null);
  const [winner, setWinner] = useState<Color | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [turn, setTurn] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [currentFEN, setCurrentFEN] = useState<string>("");

  // Promotion state
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [promotionFromCell, setPromotionFromCell] = useState<Cell | null>(null);
  const [promotionToCell, setPromotionToCell] = useState<Cell | null>(null);

  // Bot state
  const [isPlayingWithBot, setIsPlayingWithBot] = useState(false);
  const [botColor, setBotColor] = useState<Color | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [botMove, setBotMove] = useState<{from: Cell | null, to: Cell | null}>({from: null, to: null});
  const [botDifficulty, setBotDifficulty] = useState<number>(5);

  // Drag and drop state
  const [draggedCell, setDraggedCell] = useState<Cell | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const difficultyLevels = [
    { name: "Very Easy", depth: 3 },
    { name: "Easy", depth: 5 },
    { name: "Medium", depth: 8 },
    { name: "Hard", depth: 12 },
    { name: "Very Hard", depth: 15 }
  ];

  const playMoveSound = useCallback(() => {
    const audio = new Audio('/audio/move.mp3');
    audio.play().catch(error => {
      console.error('Error playing move sound:', error);
    });
  }, []);

  const swapPlayer = useCallback(() => {
    setTurn((prevTurn) => prevTurn + 0.5);
    setCurrentPlayer((prev) => (prev === whitePlayer ? blackPlayer : whitePlayer));
  }, [whitePlayer, blackPlayer]);

  const selectCell = useCallback(
    (cell: Cell) => {
      if (!board || !currentPlayer || !gameLogic || isViewingHistory) return;

      if (cell.figure && cell.figure.color === currentPlayer.color) {
        // If clicking the same piece, deselect it
        if (selectedCell === cell) {
          setSelectedCell(null);
          setAvailableMoves([]);
          setAttackMoves([]);
          return;
        }

        // If clicking a different piece of the same color, switch selection
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
    [board, currentPlayer, gameLogic, isViewingHistory, selectedCell]
  );

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

      // If clicking a different piece of the same color, switch selection
      if (cell.figure && cell.figure.color === currentPlayer.color) {
        selectCell(cell);
        return;
      }

      if (selectedCell.figure) {
        const moveSuccessful = gameLogic.moveFigure(selectedCell, cell);
        if (moveSuccessful) {
          playMoveSound();
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
            setCurrentFEN(fen);
            swapPlayer();
          }
        }
      } else {
        selectCell(cell);
      }
    },
    [board, currentPlayer, selectedCell, swapPlayer, gameLogic, winner, isDraw, promotionModalVisible, isViewingHistory, selectCell, playMoveSound]
  );

  // Initialize game
  useEffect(() => {
    restart();
  }, []);

  // Bot move effect
  useEffect(() => {
    const makeBotMove = async () => {
      if (!isPlayingWithBot || !botColor || isBotThinking || winner || isDraw || isViewingHistory || !board) return;
      if (currentPlayer.color === botColor) {
        setIsBotThinking(true);
        try {
          const response = await axios.get('https://stockfish.online/api/s/v2.php', {
            params: { fen: currentFEN, depth: botDifficulty },
          });

          if (response.data.success && response.data.bestmove) {
            const move = response.data.bestmove.split(' ')[1];
            
            // Parse coordinates from algebraic notation (e.g., "d7d5")
            const fromFile = move.charCodeAt(0) - 'a'.charCodeAt(0);
            const fromRank = 8 - parseInt(move[1]);
            const toFile = move.charCodeAt(2) - 'a'.charCodeAt(0);
            const toRank = 8 - parseInt(move[3]);

            // Validate coordinates
            if (fromFile < 0 || fromFile > 7 || fromRank < 0 || fromRank > 7 ||
                toFile < 0 || toFile > 7 || toRank < 0 || toRank > 7) {
              console.error('Invalid move coordinates:', { fromFile, fromRank, toFile, toRank });
              setIsBotThinking(false);
              return;
            }

            const fromCell = board.cells[fromRank]?.[fromFile];
            const toCell = board.cells[toRank]?.[toFile];

            if (fromCell && toCell && fromCell.figure && fromCell.figure.color === botColor) {
              setBotMove({from: fromCell, to: toCell});
              handleCellClick(fromCell);
            } else {
              console.error('Invalid cells or figure:', { fromCell, toCell });
              setIsBotThinking(false);
            }
          } else {
            console.error('Invalid response from Stockfish:', response.data);
            setIsBotThinking(false);
          }
        } catch (error) {
          console.error('Error getting bot move:', error);
          setIsBotThinking(false);
        }
      }
    };

    makeBotMove();
  }, [currentPlayer, isPlayingWithBot, botColor, currentFEN, board, winner, isDraw, isViewingHistory, handleCellClick, botDifficulty]);

  // Bot move completion effect
  useEffect(() => {
    if (botMove.from && botMove.to && selectedCell === botMove.from) {
      const timer = setTimeout(() => {
        handleCellClick(botMove.to!);
        setBotMove({from: null, to: null});
        setIsBotThinking(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedCell, botMove, handleCellClick]);

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
    setCurrentFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
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

  const handlePromotionSelect = useCallback(
    (figure: FigureName) => {
      if (!promotionFromCell || !promotionToCell || !gameLogic) return;

      gameLogic.promotion(promotionFromCell, promotionToCell, figure);
      playMoveSound(); // Play sound on promotion
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
    [promotionFromCell, promotionToCell, gameLogic, board, currentPlayer, playMoveSound]
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

  const startBotGame = (color: Color) => {
    setIsPlayingWithBot(true);
    setBotColor(color);
    setIsBotThinking(false);
    setBotMove({from: null, to: null});
    restart();
  };

  const stopBotGame = () => {
    setIsPlayingWithBot(false);
    setBotColor(null);
    setIsBotThinking(false);
    setBotMove({from: null, to: null});
    restart();
  };

  const handleDragStart = useCallback((cell: Cell, e: React.DragEvent) => {
    if (!board || !currentPlayer || !gameLogic || isViewingHistory) return;
    if (cell.figure && cell.figure.color === currentPlayer.color) {
      setIsDragging(true);
      setDraggedCell(cell);
      e.dataTransfer.setData('text/plain', '');
      if (e.dataTransfer.setDragImage && cell.figure.logo) {
        const img = new Image();
        img.src = cell.figure.logo;
        e.dataTransfer.setDragImage(img, 30, 30);
      }
    }
  }, [board, currentPlayer, gameLogic, isViewingHistory]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedCell(null);
    setAvailableMoves([]);
    setAttackMoves([]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((cell: Cell, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedCell || !board || !gameLogic || isViewingHistory) return;

    const moveSuccessful = gameLogic.moveFigure(draggedCell, cell);
    if (moveSuccessful) {
      playMoveSound();
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
        setCurrentFEN(fen);
        swapPlayer();
      }
    }
    setIsDragging(false);
    setDraggedCell(null);
  }, [draggedCell, board, gameLogic, isViewingHistory, promotionModalVisible, currentPlayer, turn, swapPlayer, playMoveSound]);

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
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              backgroundColor: "#222f3e",
              borderRadius: "15px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              minWidth: "320px",
              maxWidth: "350px",
              padding: "24px 18px",
              marginBottom: "0px",
              color: "#ecf0f1",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch"
            }}
          >
            <ChessAnalyzer fen={currentFEN}/>
          </div>
          <div
            style={{
              backgroundColor: "#222f3e",
              borderRadius: "15px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              minWidth: "320px",
              maxWidth: "350px",
              padding: "24px 18px",
              color: "#ecf0f1",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch"
            }}
          >
            <Timer currentPlayer={currentPlayer} restart={restart} winner={winner} onTimeout={handleTimeout} />
          </div>
        </div>

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
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                backgroundColor: "#34495e",
                color: "#ecf0f1",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2c3e50"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#34495e"}
            >
              {isFlipped ? "Flip to White View" : "Flip to Black View"}
            </button>

            {!isPlayingWithBot ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <select
                    value={botDifficulty}
                    onChange={(e) => setBotDifficulty(Number(e.target.value))}
                    style={{
                      backgroundColor: "#34495e",
                      color: "#ecf0f1",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                  >
                    {difficultyLevels.map((level) => (
                      <option key={level.depth} value={level.depth}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => startBotGame(Color.Black)}
                    style={{
                      backgroundColor: "#34495e",
                      color: "#ecf0f1",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2c3e50"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#34495e"}
                  >
                    Play as White vs Bot
                  </button>
                  <button
                    onClick={() => startBotGame(Color.White)}
                    style={{
                      backgroundColor: "#34495e",
                      color: "#ecf0f1",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2c3e50"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#34495e"}
                  >
                    Play as Black vs Bot
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={stopBotGame}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "#ecf0f1",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#c0392b"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#e74c3c"}
              >
                Stop Bot Game
              </button>
            )}
          </div>
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
              position: "relative",
              transform: isFlipped ? "rotate(180deg)" : "none",
            }}
          >
            {/* Column letters (a-h) */}
            <div style={{
              position: "absolute",
              bottom: "-25px",
              left: "0",
              right: "0",
              display: "flex",
              justifyContent: "space-between",
              padding: "0 20px",
              color: "#ecf0f1",
              fontSize: "16px",
              fontWeight: "bold",
              transform: isFlipped ? "rotate(180deg)" : "none",
            }}>
              {(isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']).map((letter) => (
                <span key={letter} style={{ width: `${cellSize}px`, textAlign: "center" }}>{letter}</span>
              ))}
            </div>

            {/* Row numbers (1-8) */}
            <div style={{
              position: "absolute",
              top: "0",
              left: "-25px",
              bottom: "0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "20px 0",
              color: "#ecf0f1",
              fontSize: "16px",
              fontWeight: "bold",
              transform: isFlipped ? "rotate(180deg)" : "none",
            }}>
              {(isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1]).map((number) => (
                <span key={number} style={{ height: `${cellSize}px`, display: "flex", alignItems: "center" }}>{number}</span>
              ))}
            </div>

            {board.cells.map((row, rowIndex) =>
              row.map((cell, cellIndex) => {
                const isAvailableMove = availableMoves.includes(cell);
                const isAttackMove = attackMoves.includes(cell);
                return (
                  <div
                    key={`${rowIndex}-${cellIndex}`}
                    onClick={() => handleCellClick(cell)}
                    draggable={cell.figure !== null && cell.figure.color === currentPlayer.color && !isViewingHistory}
                    onDragStart={(e) => handleDragStart(cell, e)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(cell, e)}
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
                      transform: isFlipped ? "rotate(180deg)" : "none",
                      opacity: isDragging && draggedCell === cell ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (isAvailableMove || isAttackMove) {
                        e.currentTarget.style.transform = isFlipped ? "rotate(180deg) scale(1.05)" : "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = isFlipped ? "rotate(180deg)" : "none";
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
                          userSelect: "none",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#34495e",
            padding: "10px 20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            maxHeight: "500px",
            overflowY: "auto",
            color: "#ecf0f1",
            width: "300px",
            marginLeft: "0px"
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

      <PromotionModal
        visible={promotionModalVisible}
        color={currentPlayer.color}
        onSelect={handlePromotionSelect}
      />
    </div>
  );
};

export default App;