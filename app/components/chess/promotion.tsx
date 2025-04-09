
import React from "react";
import { FigureName } from "@/app/api/chess/Figure";
import { Color } from "@/app/api/chess/Color";

interface PromotionModalProps {
  visible: boolean;
  color: Color;
  onSelect: (figure: FigureName) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ visible, color, onSelect }) => {
  if (!visible) return null;

  const figures = [
    FigureName.Queen,
    FigureName.Rook,
    FigureName.Bishop,
    FigureName.Knight,
  ];

  const figureIcons: Record<FigureName, string> = {
      Queen: "♕",
      Rook: "♖",
      Bishop: "♗",
      Knight: "♘",
      King: "", 
      Pawn: "",
      [FigureName.FIGURE]: ""
  };

  const backgroundColor = color === Color.White ? "#ffffff" : "#2c3e50";
  const textColor = color === Color.White ? "#2c3e50" : "#ecf0f1";

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor,
        color: textColor,
        padding: "20px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "15px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}>
        <h2>Choose Promotion</h2>
        <div style={{ display: "flex", gap: "20px" }}>
          {figures.map((name) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              style={{
                fontSize: "24px",
                padding: "10px 15px",
                borderRadius: "8px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                cursor: "pointer",
                minWidth: "60px",
              }}
            >
              {figureIcons[name]} {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
