// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./TicTacToeBase.sol";
import "./Interfaces/ITicTacToeFactory.sol";

contract TicTacToe is TicTacToeBase {

    constructor(address _playerOne, address _playerTwo) 
        onlyFactory 
        TicTacToeBase(_playerOne, _playerTwo) {
    }

    function move(uint8 row, uint8 col) onlyPlayers external {
        require(row > 0 && row <= 3, "Invalid row number.");
        require(col > 0 && col <= 3, "Invalid column number.");
        require(board.lastPlayerToMove != msg.sender, "This is not your turn.");
        require(board.table[row][col] == -1, "This slot is already taken.");

        board.table[row][col] = int8(msg.sender == playerOne ? 1 : 0);

        checkWinnerOrDraw();
    }

    fallback() external {
        revert();
    }
}