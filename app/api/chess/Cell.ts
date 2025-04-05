import { Figure, FigureName } from "./Figure";
import { Color } from "./Color";
import { Board } from "./board";

export class Cell {
  readonly x: number;
  readonly y: number;
  readonly color: Color;
  figure: Figure | null;
  board: Board;
  available: boolean;
  id: number;

  constructor(board: Board, x: number, y: number, color: Color, figure: Figure | null) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.color = color;
    this.figure = figure;
    this.id = Math.random();
    this.available = false;
  }

  isEmpty(): boolean {
    return this.figure === null;
  }

  isEmptyX(target: Cell): boolean {
    if (this.y !== target.y) return false;

    const min = Math.min(this.x, target.x);
    const max = Math.max(this.x, target.x);
    for (let x = min + 1; x < max; x++) {
      const cell = this.board.getCell(x, this.y);
      if (!cell) continue;
      if (!cell.isEmpty()) {
        return false;
      }
    }
    return true;
  }

  isEmptyY(target: Cell): boolean {
    if (this.x !== target.x) return false;

    const min = Math.min(this.y, target.y);
    const max = Math.max(this.y, target.y);
    for (let y = min + 1; y < max; y++) {
      const cell = this.board.getCell(this.x, y);
      if (!cell) continue;
      if (!cell.isEmpty()) {
        return false;
      }
    }
    return true;
  }

  isEmptyDiagonal(target: Cell): boolean {
    const absX = Math.abs(target.x - this.x);
    const absY = Math.abs(target.y - this.y);
    if (absX !== absY) return false;

    const dy = this.y < target.y ? 1 : -1;
    const dx = this.x < target.x ? 1 : -1;
    for (let i = 1; i < absY; i++) {
      const cell = this.board.getCell(this.x + dx * i, this.y + dy * i);
      if (!cell) continue;
      if (!cell.isEmpty()) {
        return false;
      }
    }
    return true;
  }

  setFigure(figure: Figure | null): void {
    this.figure = figure;
    if (figure) {
      figure.cell = this;
    }
  }
}
