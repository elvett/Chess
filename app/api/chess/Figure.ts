import { Cell } from "./Cell";
import { Color } from "./Color";

export enum FigureName {
    FIGURE = "FIGURE",
    Pawn = "Pawn",
    Bishop = "Bishop",
    King = "King",
    Knight = "Knight",
    Queen = "Queen",
    Rook = "Rook",
}

export class Figure {
    color: Color;
    cell: Cell;
    name: FigureName;
    logo: string | null; 
    id: number;

    constructor(color: Color, cell: Cell, logo: string | null = null) {
        this.color = color;
        this.cell = cell;
        this.cell.figure = this;
        this.logo = logo;
        this.name = FigureName.FIGURE;
        this.id = Math.random();
    }


    canMove(target: Cell): boolean {
        if (target.figure?.color === this.color)
            return false
        return true;
    }
    
}
