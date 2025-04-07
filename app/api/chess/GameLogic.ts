import { Board } from "./board";
import { FigureName } from "./Figure";
import { Color } from "./Color";
import { Cell } from "./Cell";

export class GameLogic {
  board: Board;
  moveHistory: MoveHistory[];

  constructor(board: Board) {
    this.board = board;
    this.moveHistory = [];
  }

  moveFigure(from: Cell, to: Cell): boolean {
    if (!from.figure || !this.canReallyMove(from, to)) {
      return false;
    }

    const movingFigure = from.figure;
    to.setFigure(movingFigure);
    from.setFigure(null);
    return true;
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
