import { Board } from "@/app/api/chess/board";
import React, { useEffect } from "react";
import { useState } from "react";

const app = () => {
    const [board, setBoard] = useState(new Board())  

    useEffect(()=> {
        restart()
    } )

    function restart(){
        const newBoard = new Board();
        newBoard.initCells()
        setBoard(newBoard)
    }
}