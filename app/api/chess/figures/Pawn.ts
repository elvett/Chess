import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";

export class Pawn extends Figure {
    FirstStep: boolean = true;

    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.Pawn;
        this.logo = color === Color.Black 
            ? "./chessP/pawn1.png" 
            : "./chessP/pawn.png"; 
    }

    canMove(target: Cell): boolean {
        if (!super.canMove(target)) return false;
        
        const direction = this.cell.figure?.color === Color.Black ? 1 : -1;
        
        if (
            (target.y === this.cell.y + direction && target.x === this.cell.x && this.cell.board.getCell(target.x, target.y)?.isEmpty()) || 
            (this.FirstStep && target.y === this.cell.y + direction * 2 &&
            this.cell.isEmptyY(target) &&
            target.x === this.cell.x &&
            (this.cell.y === 1 || this.cell.y === 6) &&
            this.cell.board.getCell(target.x, target.y)?.isEmpty())
        ) {
            return true;
        }

        const absX = Math.abs(target.x - this.cell.x);
        const absY = Math.abs(target.y - this.cell.y);
        if (
            absX === 1 &&
            absY === 1 &&
            target.y === this.cell.y + direction && 
            !this.cell.board.getCell(target.x, target.y)?.isEmpty()
        ) {
            return true;
        }
        
        return false;
    }
}
