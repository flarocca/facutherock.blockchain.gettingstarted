// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

library BoardUtils {

    struct Board {
       int8[3][3] table;
       address lastPlayerToMove;
    }

    function getWinner(Board storage board, address playerOne, address playerTwo) 
        public view returns(address) {

        address winner = _getWinnerByRows(board, playerOne, playerTwo);
        if(winner != address(0)) {
            return winner;
        }

        winner = _getWinnerByColumns(board, playerOne, playerTwo);
        if(winner != address(0)) {
            return winner;
        }

        winner =_getWinnerByDiags(board, playerOne, playerTwo);
        if(winner != address(0)) {
            return winner;
        }

        if(_isDraw(board)) {
            return address(1);
        }

        return address(0);
    }

    function _getWinnerByRows(Board storage board, address playerOne, address playerTwo) 
        private view returns(address) {

        if(board.table[0][0] != -1 && board.table[0][0] == board.table[0][1] && board.table[0][1] == board.table[0][2]) {
            return board.table[0][0] == 0 ? playerOne : playerTwo;
        }

        if(board.table[1][0] != -1 && board.table[1][0] == board.table[1][1] && board.table[1][1] == board.table[1][2]) {
            return board.table[1][0] == 0 ? playerOne : playerTwo;
        }

        if(board.table[2][0] != -1 && board.table[2][0] == board.table[2][1] && board.table[2][1] == board.table[2][2]) {
            return board.table[2][0] == 0 ? playerOne : playerTwo;
        }

        return address(0);
    }

    function _getWinnerByColumns(Board storage board, address playerOne, address playerTwo) 
        private view returns(address) {

        if(board.table[0][0] != -1 && board.table[0][0] == board.table[1][0] && board.table[1][0] == board.table[2][0]) {
            return board.table[0][0] == 0 ? playerOne : playerTwo;
        }

        if(board.table[0][1] != -1 && board.table[0][1] == board.table[1][1] && board.table[1][1] == board.table[2][1]) {
            return board.table[0][1] == 0 ? playerOne : playerTwo;
        }

        if(board.table[0][2] != -1 && board.table[0][2] == board.table[1][2] && board.table[1][2] == board.table[2][2]) {
            return board.table[0][2] == 0 ? playerOne : playerTwo;
        }

        return address(0);
    }

    function _getWinnerByDiags(Board storage board, address playerOne, address playerTwo) 
        private view returns(address) {

        if(board.table[0][0] != -1 && board.table[0][0] == board.table[1][1] && board.table[1][1] == board.table[2][2]) {
            return board.table[0][0] == 0 ? playerOne : playerTwo;
        }

        if(board.table[2][0] != -1 && board.table[2][0] == board.table[1][1] && board.table[1][1] == board.table[0][2]) {
            return board.table[2][0] == 0 ? playerOne : playerTwo;
        }

        return address(0);
    }

    function _isDraw(Board storage board) 
        private view returns(bool) {
        for (uint8 row = 0; row < 3; row++) {
            for (uint8 col = 0; col < 3; col++) {
                if(board.table[row][col] == -1) {
                    return false;
                }
            }
        }

        return true;
    }
}