import { King } from "./figures/king";
import { Cell } from "./Cell";
import { Color } from "./Color";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/queen";
import { Rook } from "./figures/Rook";
import { Knight } from "./figures/knight";
import { bishop } from "./figures/bishop";

export class Board {
    updateBoard() {
      throw new Error("Method not implemented.");
    }
    cells: Cell[][] = [];

    public initCells(): void {
        this.cells = [];
        for (let i = 0; i < 8; i++) {
            const row: Cell[] = [];
            for (let j = 0; j < 8; j++) {
                row.push(new Cell(this, j, i, (i + j) % 2 === 0 ? Color.White : Color.Black, null));
            }
            this.cells.push(row);
        }
    }

    public getCell(x: number, y: number): Cell | null {
        return this.cells[y]?.[x] || null;
    }

    
    private addPawns() {
        for (let i = 0; i < 8; i++) {
            new Pawn(Color.Black, this.getCell(i, 1)!);
            new Pawn(Color.White, this.getCell(i, 6)!);
        }
    }

    private addRooks() {
        new Rook(Color.Black, this.getCell(0, 0)!);
        new Rook(Color.Black, this.getCell(7, 0)!);
        new Rook(Color.White, this.getCell(0, 7)!);
        new Rook(Color.White, this.getCell(7, 7)!);
    }

    private addKnights() {
        new Knight(Color.Black, this.getCell(1, 0)!);
        new Knight(Color.Black, this.getCell(6, 0)!);
        new Knight(Color.White, this.getCell(1, 7)!);
        new Knight(Color.White, this.getCell(6, 7)!);
    }

    private addBishops() {
        new bishop(Color.Black, this.getCell(2, 0)!);
        new bishop(Color.Black, this.getCell(5, 0)!);
        new bishop(Color.White, this.getCell(2, 7)!);
        new bishop(Color.White, this.getCell(5, 7)!);
    }

    private addRoyals() {
        new Queen(Color.Black, this.getCell(3, 0)!);
        new King(Color.Black, this.getCell(4, 0)!);
        new Queen(Color.White, this.getCell(3, 7)!);
        new King(Color.White, this.getCell(4, 7)!);
    }

    public addFigures() {
        this.addPawns();
        this.addRooks();
        this.addKnights();
        this.addBishops();
        this.addRoyals();
    }
}
