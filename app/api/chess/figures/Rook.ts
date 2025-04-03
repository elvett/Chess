import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";

export class Rook extends Figure {
    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.Rook;
        this.logo = color === Color.Black ? "/chessP/rook1.png" : "/chessP/rook.png"; // Use correct image names
    }

    canMove(target: Cell): boolean {
        if (!super.canMove(target))
            return false;
        if (this.cell.isEmptyY(target))
            return true;
        if (this.cell.isEmptyX(target))
            return true;
        return false;
         
    }
}




