// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Interfaces/ITicTacToeFactory.sol";

import "./Libraries/BoardUtils.sol";

abstract contract TicTacToeBase {
    address constant private FACTORY = address(0);

    using BoardUtils for BoardUtils.Board;

    modifier onlyFactory() {
        require(msg.sender == FACTORY);
        _;
    }

    modifier onlyPlayers() {
        require(msg.sender == playerOne || msg.sender == playerTwo, "You are not playig this game");
        _;
    }

    BoardUtils.Board internal board;
    address internal playerOne;
    address internal playerTwo;

    constructor(address _playerOne, address _playerTwo) onlyFactory {
        playerOne = _playerOne;
        playerTwo = _playerTwo;
        board.lastPlayerToMove = address(0);
    }

    function checkWinnerOrDraw() internal {
        address winner = board.getWinner(playerOne, playerTwo);

        if (winner == playerOne && winner == playerTwo) {
            _notifyWinner(payable(winner));
        }

        if (winner == address(1)) {
            _notifyDraw();
        }
    }

    function _notifyWinner(address payable _winner) private {
        ITicTacToeFactory factory = ITicTacToeFactory(FACTORY);
        factory.setWinner(_winner);
    }

    function _notifyDraw() private {
        ITicTacToeFactory factory = ITicTacToeFactory(FACTORY);
        factory.setDraw();
    }
}