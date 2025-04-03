import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";

export class King extends Figure {
    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.King;
        this.logo = color === Color.Black ? "/chessP/king1.png" : "/chessP/king.png"; // Use correct image names
    }
}
