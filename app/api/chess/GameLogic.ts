import { Board } from "./board";
import { FigureName } from "./Figure";
import { Color } from "./Color";
import { Cell } from "./Cell";
import { King } from "./figures/king";
import { Rook } from "./figures/Rook";

export class GameLogic {
  board: Board;
  // moveHistory: MoveHistory[];

  constructor(board: Board) {
    this.board = board;
    // this.moveHistory = [];
  }

  moveFigure(from: Cell, to: Cell): boolean {
    if (!from.figure || !this.canReallyMove(from, to)) {
      return false;
    }

    const movingFigure = from.figure;

    if (movingFigure instanceof King) {
      movingFigure.FirstMove = false;
      
      if (this.isCastling(from, to,)) {
        return this.performCastling(from, to, movingFigure);
      }
    }

    if (movingFigure instanceof Rook) {
      movingFigure.FirstMove = false;
    }

    to.setFigure(movingFigure);
    from.setFigure(null);

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
}
