import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";

export class Queen extends Figure {
    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.Queen;
        this.logo = color === Color.Black ? "/chessP/queen1.png" : "/chessP/queen.png"; 
    }
    canMove(target: Cell): boolean {
        if (!super.canMove(target))
            return false;
        if (this.cell.isEmptyDiagonal(target))
            return true;
        if (this.cell.isEmptyY(target))
            return true;
        if (this.cell.isEmptyX(target))
            return true;
        return false;
         
    }
}
