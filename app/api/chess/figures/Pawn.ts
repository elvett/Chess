import { Cell } from "../Cell";
import { Color } from "../Color";
import { Figure } from "../Figure";
import { FigureName } from "../Figure";

export class Pawn extends Figure {
    FirstStep: boolean = true;
    constructor(color: Color, cell: Cell) {
        super(color, cell);
        this.name = FigureName.Pawn;
        this.logo = color === Color.Black ? "/chessP/pawn1.png" : "/chessP/pawn.png"; // Use correct image names
    }


    canMove(target: Cell): boolean {
        if (!super.canMove(target))
            return false;
        const directon = this.cell.figure?.color === Color.Black ? 1 : -1
        const FirstStepDirecton = this.cell.figure?.color === Color.Black ? 2 : -2
        if((target.y ===this.cell.y + directon ||this.FirstStep && 
            (target.y ===this.cell.y + FirstStepDirecton))
            && target.x === this.cell.x
            && this.cell.board.getCell(target.x, target.y)?.isEmpty()){
                return true;
            }
        
        return false;
         
    }
    move(target: Cell): void {
        super.move(target)
        this.FirstStep =false;
        console.log("b")
        
    }
}

