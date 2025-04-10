import React, { useState } from "react";

interface FenViewProps {
  fenHistory: string[]; 
}

const FenView: React.FC<FenViewProps> = ({ fenHistory }) => {
  const [currentFenIndex, setCurrentFenIndex] = useState(0);

  const handlePrevious = () => {
    if (currentFenIndex > 0) {
      setCurrentFenIndex(currentFenIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentFenIndex < fenHistory.length - 1) {
      setCurrentFenIndex(currentFenIndex + 1);
    }
  };

  const renderFenHistory = () => {
    const moves = fenHistory.map((fen, index) => {
      return (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "5px",
            cursor: "pointer",
            backgroundColor: index === currentFenIndex ? "#e74c3c" : "#bdc3c7",
            borderRadius: "5px",
            margin: "2px 0",
            color: "#fff",
          }}
          onClick={() => setCurrentFenIndex(index)}
        >
          <span>{`Move ${index + 1}: ${fen}`}</span>
        </div>
      );
    });

    return moves;
  };

  return (
    <div
      style={{
        backgroundColor: "#34495e",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        minWidth: "300px",
      }}
    >
      <h3
        style={{
          color: "#ecf0f1",
          marginBottom: "15px",
          textAlign: "center",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        History of Moves (FEN)
      </h3>
      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          marginBottom: "15px",
        }}
      >
        {renderFenHistory()}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handlePrevious}
          style={{
            backgroundColor: "#2980b9",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          style={{
            backgroundColor: "#2980b9",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FenView;
