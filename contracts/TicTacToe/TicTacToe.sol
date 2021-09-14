// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "./TicTacToeBase.sol";

contract TicTacToe is TicTacToeBase {

    // TODO: Test events
    event MoveCompleted(address player, uint row, uint col);

    modifier validateSlot(uint _row, uint _col)  {
        require(_row >= 0 && _row < 3, "Invalid row number.");
        require(_col >= 0 && _col < 3, "Invalid column number.");
        require(board.table[_row][_col] == -1, "This slot is already taken.");
        _;
    }

    function move(uint _row, uint _col) 
        onlyAtState(State.Playing)
        onlyPlayers(playerOne, playerTwo)
        validateSlot(_row, _col)
        external {
        
            require(board.lastPlayerToMove != msg.sender, "This is not your turn.");

            board.table[_row][_col] = int8(msg.sender == playerOne ? 1 : 0);
            board.lastPlayerToMove = msg.sender;

            emit MoveCompleted(msg.sender, _row, _col);

            checkWinner();
        }
}