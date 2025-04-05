import React, { FC, useEffect, useRef, useState } from "react";
import { Player } from "../../api/chess/Player";
import { Color } from "../../api/chess/Color";

interface TimerProps {
  currentPlayer: Player | null;
  restart: () => void;
}

const Timer: FC<TimerProps> = ({ currentPlayer, restart }) => {
  const [withTimer, setWithTimer] = useState<boolean>(true);
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [blackTime, setBlackTime] = useState(initialMinutes * 60);
  const [whiteTime, setWhiteTime] = useState(initialMinutes * 60);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (withTimer) {
      startTimer();
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [currentPlayer, withTimer]);

  const startTimer = () => {
    if (timer.current) clearInterval(timer.current);
    if (!withTimer) return;
    const callback =
      currentPlayer?.color === Color.White
        ? decrementWhiteTimer
        : decrementBlackTimer;
    timer.current = setInterval(callback, 1000);
  };

  const decrementBlackTimer = () => {
    setBlackTime((prev) => Math.max(prev - 1, 0));
  };

  const decrementWhiteTimer = () => {
    setWhiteTime((prev) => Math.max(prev - 1, 0));
  };

  const handleRestart = () => {
    setWhiteTime(initialMinutes * 60);
    setBlackTime(initialMinutes * 60);
    restart();
    if (withTimer) startTimer();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getTimeColor = (time: number) => {
    if (time <= 30) return "#ff4444";
    if (time <= 120) return "#ffa500";
    return "#ffffff";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        height: "100%",
      }}
    >
      <label style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#ecf0f1",
        fontWeight: "500"
      }}>
        <input
          type="checkbox"
          checked={withTimer}
          onChange={() => {
            setWithTimer(prev => !prev);
            if (timer.current) clearInterval(timer.current);
          }}
          style={{ cursor: "pointer" }}
        />
        Play with timer
      </label>

      {withTimer && (
        <>
          <label style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            color: "#ecf0f1"
          }}>
            Time per player (min):
            <input
              type="number"
              min={1}
              value={initialMinutes}
              onChange={(e) => {
                const newMinutes = Math.max(1, Number(e.target.value));
                setInitialMinutes(newMinutes);
                setWhiteTime(newMinutes * 60);
                setBlackTime(newMinutes * 60);
              }}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #7f8c8d",
                width: "100px",
                backgroundColor: "#2c3e50",
                color: "#ecf0f1"
              }}
            />
          </label>

          <div style={{
            background: currentPlayer?.color === Color.Black 
              ? "linear-gradient(135deg, #2c3e50, #1a252f)" 
              : "#34495e",
            padding: "20px",
            borderRadius: "12px",
            border: currentPlayer?.color === Color.Black 
              ? "2px solid #3498db" 
              : "2px solid #7f8c8d",
            boxShadow: currentPlayer?.color === Color.Black 
              ? "0 0 15px rgba(52, 152, 219, 0.5)" 
              : "0 4px 10px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}>
            <h2 style={{
              color: getTimeColor(blackTime),
              margin: "0 0 10px 0",
              fontSize: "1.8rem",
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
              fontWeight: "600",
            }}>
              Black: {formatTime(blackTime)}
            </h2>
          </div>

          <div style={{
            background: currentPlayer?.color === Color.White 
              ? "linear-gradient(135deg, #2c3e50, #1a252f)" 
              : "#34495e",
            padding: "20px",
            borderRadius: "12px",
            border: currentPlayer?.color === Color.White 
              ? "2px solid #3498db" 
              : "2px solid #7f8c8d",
            boxShadow: currentPlayer?.color === Color.White 
              ? "0 0 15px rgba(52, 152, 219, 0.5)" 
              : "0 4px 10px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}>
            <h2 style={{
              color: getTimeColor(whiteTime),
              margin: 0,
              fontSize: "1.8rem",
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
              fontWeight: "600",
            }}>
              White: {formatTime(whiteTime)}
            </h2>
          </div>

          <button
            onClick={handleRestart}
            style={{
              background: "linear-gradient(to right, #3498db, #2980b9)",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              transition: "transform 0.2s, box-shadow 0.2s",
              marginTop: "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Restart Game
          </button>
        </>
      )}
    </div>
  );
};

export default Timer;