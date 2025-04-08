import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";
import { Rook } from "./Rook";

export class King extends Figure {
    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.King;
        this.logo = color === Color.Black ? "./chessP/king1.png" : "./chessP/king.png";
        this.FirstMove = true;
    }
    
    canMove(target: Cell): boolean {
        if (!super.canMove(target)) 
            return false;

        const directionX = Math.abs(this.cell.x - target.x);
        const directionY = Math.abs(this.cell.y - target.y);
        const castleY = this.color === Color.Black ? 0 : 7;
    
        if (
            this.FirstMove &&
            target.y === castleY &&
            (target.x === 2 || target.x === 6)
        ) {
            const rookX = target.x === 2 ? 0 : 7;
            const rookCell = this.cell.board.getCell(rookX, castleY);
            const rook = rookCell?.figure;

            if (
                rook instanceof Rook &&
                rook.color === this.color &&
                rook.FirstMove
            ) {
                const pathIsClear = this.cell.isEmptyX(target);
                if (!pathIsClear) return false;
    
               
                const middleX = target.x === 2 ? 3 : 5;
                const cellsToCheck = [
                    this.cell.board.getCell(this.cell.x, castleY), 
                    this.cell.board.getCell(middleX, castleY),     
                    this.cell.board.getCell(target.x, castleY)    
                ];

                for (const cell of cellsToCheck) {
                    if (!cell || cell.isUnderAttack(this.color)) {
                        return false;
                    }
                }
                return true;
            }
        }

        return directionX <= 1 && directionY <= 1;
    }

}
