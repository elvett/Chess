import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";

export class bishop extends Figure {
    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.Bishop;
        this.logo = color === Color.Black ? "./chessP/bishop1.png" : "./chessP/bishop.png"; 
    }

    canMove(target: Cell): boolean {
        if (!super.canMove(target))
            return false;
        if (this.cell.isEmptyDiagonal(target))
            return true;
        return false;
         
    }
}



