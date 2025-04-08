import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";

export class Knight extends Figure {
    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.Knight;
        this.logo = color === Color.Black ? "./chessP/knight1.png" : "./chessP/knight.png";
    }
    
    canMove(target: Cell): boolean {
        if (!super.canMove(target))
            return false;
        const dx = Math.abs(this.cell.x - target.x);
        const dy = Math.abs(this.cell.y - target.y);
        return (dx === 2 && dy === 1  || dx === 1 && dy === 2);
         
    }
}



