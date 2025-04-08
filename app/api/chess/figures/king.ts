import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";
import { Rook } from "./Rook";

export class King extends Figure {
    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.King;
        this.logo = color === Color.Black ? "/chessP/king1.png" : "/chessP/king.png";
        this.FirstMove = true;
    }
    
    canMove(target: Cell): boolean {
        if (!super.canMove(target))
            return false;

        const directionX = Math.abs(this.cell.x - target.x);
        const directionY = Math.abs(this.cell.y - target.y);

        const castleY = this.cell.figure?.color === Color.Black ? 0 : 7;
        
        if (this.FirstMove && target.y === castleY &&
            this.cell.isEmptyX(target) && 
            this.cell.board.getCell(target.x, target.y)?.isEmpty() &&
            (target.x === 2 || target.x === 6)) {
            const rookCell = this.cell.board.getCell(target.x === 2 ? 0 : 7, castleY);
            const rook = rookCell?.figure as Rook;

            
            if (rook && rook.FirstMove) {
                return true;
            }
        }

        return directionX <= 1 && directionY <= 1;
    }

}
