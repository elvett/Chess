import { Board } from "./board";
import { Figure, FigureName } from "./Figure";
import { Color } from "./Color";
import { Cell } from "./Cell";
import { King } from "./figures/king";
import { Rook } from "./figures/Rook";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/queen";
import { bishop } from "./figures/bishop";
import { Knight } from "./figures/knight";
import { Player } from "./Player";

export class GameLogic {
  board: Board;
  promptPromotion: ((from: Cell, to: Cell, onSelect: (figureName: FigureName) => void) => void) | null = null;
  private positionHistory: Map<string, number> = new Map();

  constructor(board: Board) {
    this.board = board;
  }

  moveFigure(from: Cell, to: Cell, promotionType: FigureName | null = null): boolean {
    if (!from.figure || !this.canReallyMove(from, to)) {
      return false;
    }
  
    const movingFigure = from.figure;
    const positionKey = this.getPositionKey();
    const count = (this.positionHistory.get(positionKey) || 0) + 1;
    this.positionHistory.set(positionKey, count);
  
    if (
      movingFigure instanceof Pawn &&
      from.x !== to.x &&
      to.isEmpty()
    ) {
      const direction = movingFigure.color === Color.Black ? -1 : 1;
      const capturedPawnCell = this.board.getCell(to.x, to.y + direction);
      if (
        capturedPawnCell?.figure instanceof Pawn &&
        capturedPawnCell.figure.color !== movingFigure.color &&
        capturedPawnCell.figure.enPassantable
      ) {
        capturedPawnCell.setFigure(null);
      }
    }
  
    if (movingFigure instanceof Pawn) {
      const dy = to.y - from.y;
      const promotionY = movingFigure.color === Color.Black ? 7 : 0;
  
      movingFigure.enPassantable = Math.abs(dy) === 2;
  
      if (to.y === promotionY) {
        if (this.promptPromotion) {
          this.promptPromotion(from, to, (figureName: FigureName) => {
            this.promotion(from, to, figureName);
          });
        } else {
          this.promotion(from, to, promotionType ?? FigureName.Queen);
        }
        return true;
      }
    }
  
    if (movingFigure instanceof King) {
      movingFigure.FirstMove = false;
  
      if (this.isCastling(from, to)) {
        return this.performCastling(from, to, movingFigure);
      }
    }
  
    if (movingFigure instanceof Rook) {
      movingFigure.FirstMove = false;
    }
  
    to.setFigure(movingFigure);
    from.setFigure(null);

    this.board.cells.flat().forEach(cell => {
      const fig = cell.figure;
      if (fig instanceof Pawn && fig !== movingFigure) {
        fig.enPassantable = false;
      }
    });
  
    return true;
  }
  

  private isCastling(from: Cell, to: Cell): boolean {
    return to.x === from.x + 2 || to.x === from.x - 2;
  }

  private performCastling(from: Cell, to: Cell, king: King): boolean {
    const rookX = to.x > from.x ? to.x + 1 : to.x - 2;
    const rookCell = this.board.getCell(rookX, to.y);

    if (rookCell && rookCell.figure instanceof Rook && rookCell.figure.FirstMove) {
      const rook = rookCell.figure;

      const rookToX = to.x > from.x ? to.x - 1 : to.x + 1;
      const rookTo = this.board.getCell(rookToX, to.y);

      if (rookTo) {
        rookTo.setFigure(rook);
        rookCell.setFigure(null);
        to.setFigure(king);
        from.setFigure(null);
        rook.FirstMove = false;
        return true;
      }
    }
    return false;
  }

  canMove(from: Cell, to: Cell): boolean {
    return from.figure?.canMove(to) ?? false;
  }

  promotion(from: Cell, to: Cell, figureName: FigureName): void {
    let promotedFigure: Figure;

    
    const movingFigure = from.figure;
    
    if (!movingFigure) return;

    switch (figureName) {
      case FigureName.Queen:
        promotedFigure = new Queen(movingFigure.color, to);
        break;
      case FigureName.Rook:
        promotedFigure = new Rook(movingFigure.color, to);
        break;
      case FigureName.Bishop:
        promotedFigure = new bishop(movingFigure.color, to);
        break;
      case FigureName.Knight:
        promotedFigure = new Knight(movingFigure.color, to);
        break;
      default:
        promotedFigure = new Queen(movingFigure.color, to);
    }

    
    to.setFigure(promotedFigure);
    from.setFigure(null);
}

  isKingInCheck(playerColor: Color): boolean {
    const kingCell = this.findKing(playerColor);
    if (!kingCell) return false;

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const cell = this.board.getCell(x, y);
        if (!cell || !cell.figure) continue;

        if (cell.figure.color !== playerColor && cell.figure.canMove(kingCell)) {
          return true;
        }
      }
    }
    return false;
  }

  isCheckmate(playerColor: Color): boolean {
    if (!this.isKingInCheck(playerColor)) return false;

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const from = this.board.getCell(x, y);
        if (!from || !from.figure || from.figure.color !== playerColor) continue;

        for (let dx = 0; dx < 8; dx++) {
          for (let dy = 0; dy < 8; dy++) {
            const to = this.board.getCell(dx, dy);
            if (!to) continue;

            if (this.canReallyMove(from, to)) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  private findKing(playerColor: Color): Cell | null {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const cell = this.board.getCell(x, y);
        if (!cell || !cell.figure) continue;

        if (cell.figure.name === FigureName.King && cell.figure.color === playerColor) {
          return cell;
        }
      }
    }
    return null;
  }

  canReallyMove(from: Cell, target: Cell): boolean {
    if (!from.figure || !from.figure.canMove(target)) return false;

    const currentFigure = from.figure;
    const capturedFigure = target.figure;

    target.setFigure(currentFigure);
    from.setFigure(null);

    const isInCheck = this.isKingInCheck(currentFigure.color);

    from.setFigure(currentFigure);
    target.setFigure(capturedFigure);

    return !isInCheck;
  }

  isStalemate(playerColor: Color): boolean {
    if (this.isKingInCheck(playerColor)) return false;

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const from = this.board.getCell(x, y);
        if (!from || !from.figure || from.figure.color !== playerColor) continue;

        for (let dx = 0; dx < 8; dx++) {
          for (let dy = 0; dy < 8; dy++) {
            const to = this.board.getCell(dx, dy);
            if (!to) continue;

            if (this.canReallyMove(from, to)) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  private getPositionKey(): string {
    return this.board.generateFEN(new Player(this.board.cells[0][0].figure?.color || Color.White), 0);
  }

  isThreefoldRepetition(): boolean {
    const positionKey = this.getPositionKey();
    const count = (this.positionHistory.get(positionKey) || 0) + 1;
    this.positionHistory.set(positionKey, count);
    return count >= 3;
  }
}
