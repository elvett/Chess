import { King } from "./figures/king";
import { Cell } from "./Cell";
import { Color } from "./Color";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/queen";
import { Rook } from "./figures/Rook";
import { Knight } from "./figures/knight";
import { bishop } from "./figures/bishop";
import { Figure, FigureName } from "./Figure";
import { Player } from "./Player";

export class Board {
    cells: Cell[][] = [];
    halfmove:number =0;

    public initCells(): void {
        this.cells = [];
        for (let i = 0; i < 8; i++) {
            const row: Cell[] = [];
            for (let j = 0; j < 8; j++) {
                row.push(new Cell(this, j, i, (i + j) % 2 === 0 ? Color.White : Color.Black, null));
            }
            this.cells.push(row);
        }
    }

    public getCell(x: number, y: number): Cell | null {
        return this.cells[y]?.[x] || null;
    }

    generateFEN(player: Player, moveCount: number): string {
        const turncolor = player.color === Color.White ? "b" : "w";
        let fen = "";

        for (let y = 0; y < 8; y++) {
            let empty = 0;
            for (let x = 0; x < 8; x++) {
                const cell = this.getCell(x, y);
                const figure = cell?.figure;

                if (figure) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += this.getFENSymbol(figure);
                } else {
                    empty++;
                }
            }

            if (empty > 0) fen += empty;
            if (y < 7) fen += "/";
        }

   
        let castlingRights = "";
        const whiteKing = this.getCell(4, 7)?.figure;
        const blackKing = this.getCell(4, 0)?.figure;
        const whiteRookLeft = this.getCell(0, 7)?.figure;
        const whiteRookRight = this.getCell(7, 7)?.figure;
        const blackRookLeft = this.getCell(0, 0)?.figure;
        const blackRookRight = this.getCell(7, 0)?.figure;

        if (whiteKing instanceof King && whiteKing.FirstMove) {
            if (whiteRookLeft instanceof Rook && whiteRookLeft.FirstMove) castlingRights += "Q";
            if (whiteRookRight instanceof Rook && whiteRookRight.FirstMove) castlingRights += "K";
        }
        if (blackKing instanceof King && blackKing.FirstMove) {
            if (blackRookLeft instanceof Rook && blackRookLeft.FirstMove) castlingRights += "q";
            if (blackRookRight instanceof Rook && blackRookRight.FirstMove) castlingRights += "k";
        }
        if (!castlingRights) castlingRights = "-";

      
        let enPassant = "-";
        const enPassantPawns = this.cells.flat().filter(cell => 
            cell.figure instanceof Pawn && cell.figure.enPassantable
        );
        if (enPassantPawns.length > 0) {
            const pawn = enPassantPawns[0];
            const direction = pawn.figure?.color === Color.Black ? -1 : 1;
            enPassant = this.getCellCoordinates(pawn.x, pawn.y + direction);
        }

        fen += ` ${turncolor} ${castlingRights} ${enPassant} ${this.halfmove} ${Math.floor(moveCount) + 1}`;

        return fen;
    }

    private getCellCoordinates(x: number, y: number): string {
        const files = "abcdefgh";
        return `${files[x]}${8 - y}`;
    }

    loadFromFEN(fen: string) {
        const [position, castling, enPassant,] = fen.split(" ");
        const rows = position.split("/"); 
        this.initCells(); 

        for (let i = 0; i < 8; i++) {
            const row = rows[i];
            let cellIndex = 0;

            for (let j = 0; j < row.length; j++) {
                const char = row[j];

                if (parseInt(char)) {
                    const emptyCells = parseInt(char);
                    cellIndex += emptyCells;
                } else {
                    const figure = this.createFigureFromFEN(char, i, cellIndex);
                    const cell = this.cells[i][cellIndex];
                    cell.figure = figure;
                    cellIndex++;
                }
            }
        }


        if (castling !== "-") {
            const whiteKing = this.getCell(4, 7)?.figure;
            const blackKing = this.getCell(4, 0)?.figure;
            const whiteRookLeft = this.getCell(0, 7)?.figure;
            const whiteRookRight = this.getCell(7, 7)?.figure;
            const blackRookLeft = this.getCell(0, 0)?.figure;
            const blackRookRight = this.getCell(7, 0)?.figure;

            if (whiteKing instanceof King) {
                whiteKing.FirstMove = castling.includes("K") || castling.includes("Q");
            }
            if (blackKing instanceof King) {
                blackKing.FirstMove = castling.includes("k") || castling.includes("q");
            }

            if (whiteRookLeft instanceof Rook) {
                whiteRookLeft.FirstMove = castling.includes("Q");
            }
            if (whiteRookRight instanceof Rook) {
                whiteRookRight.FirstMove = castling.includes("K");
            }
            if (blackRookLeft instanceof Rook) {
                blackRookLeft.FirstMove = castling.includes("q");
            }
            if (blackRookRight instanceof Rook) {
                blackRookRight.FirstMove = castling.includes("k");
            }
        }

        if (enPassant !== "-") {
            const files = "abcdefgh";
            const x = files.indexOf(enPassant[0]);
            const y = 8 - parseInt(enPassant[1]);
            const cell = this.getCell(x, y);
            if (cell?.figure instanceof Pawn) {
                cell.figure.enPassantable = true;
            }
        }
    }

    private getFENSymbol(figure: Figure): string {
        const map: Record<string, string> = {
            [FigureName.Pawn]: "p",
            [FigureName.Rook]: "r",
            [FigureName.Knight]: "n",
            [FigureName.Bishop]: "b",
            [FigureName.Queen]: "q",
            [FigureName.King]: "k",
        };

        const symbol = map[figure.name];
        return figure.color === Color.White ? symbol.toUpperCase() : symbol;
    }

    private createFigureFromFEN(fenChar: string, row: number, col: number): Figure | null {
        const isWhite = fenChar === fenChar.toUpperCase();
        const color = isWhite ? Color.White : Color.Black;
        const figureChar = fenChar.toLowerCase();

        switch (figureChar) {
            case 'p':
                return new Pawn(color, this.getCell(col, row)!);
            case 'r':
                return new Rook(color, this.getCell(col, row)!);
            case 'n':
                return new Knight(color, this.getCell(col, row)!);
            case 'b':
                return new bishop(color, this.getCell(col, row)!);
            case 'q':
                return new Queen(color, this.getCell(col, row)!);
            case 'k':
                return new King(color, this.getCell(col, row)!);
            default:
                return null;
        }
    }

    private addPawns() {
        for (let i = 0; i < 8; i++) {
            new Pawn(Color.Black, this.getCell(i, 1)!);
            new Pawn(Color.White, this.getCell(i, 6)!);
        }
    }

    private addRooks() {
        new Rook(Color.Black, this.getCell(0, 0)!);
        new Rook(Color.Black, this.getCell(7, 0)!);
        new Rook(Color.White, this.getCell(0, 7)!);
        new Rook(Color.White, this.getCell(7, 7)!);
    }

    private addKnights() {
        new Knight(Color.Black, this.getCell(1, 0)!);
        new Knight(Color.Black, this.getCell(6, 0)!);
        new Knight(Color.White, this.getCell(1, 7)!);
        new Knight(Color.White, this.getCell(6, 7)!);
    }

    private addBishops() {
        new bishop(Color.Black, this.getCell(2, 0)!);
        new bishop(Color.Black, this.getCell(5, 0)!);
        new bishop(Color.White, this.getCell(2, 7)!);
        new bishop(Color.White, this.getCell(5, 7)!);
    }

    private addRoyals() {
        new Queen(Color.Black, this.getCell(3, 0)!);
        new King(Color.Black, this.getCell(4, 0)!);
        new Queen(Color.White, this.getCell(3, 7)!);
        new King(Color.White, this.getCell(4, 7)!);
    }

    public addFigures() {
        this.addPawns();
        this.addRooks();
        this.addKnights();
        this.addBishops();
        this.addRoyals();
    }
}




    