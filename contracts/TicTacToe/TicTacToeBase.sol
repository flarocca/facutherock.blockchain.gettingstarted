// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "./Interfaces/IFactory.sol";
import "./TicTacToeStateMachine.sol";
import "./Libraries/BoardUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract TicTacToeBase is TicTacToeStateMachine, Ownable {
    using BoardUtils for BoardUtils.Board;

    // TODO: Test events
    event FactorySet(address factoryAddress);
    event GameInitialized();
    event GameWon(address winner);
    event StateChanged(string newState);

    // TODO: Implement eternal storage
    address public factoryAddress;
    address public playerOne;
    address public playerTwo;
    BoardUtils.Board internal board;

    modifier onlyPlayers(address _playerOne, address _playerTwo) {
        require(msg.sender == _playerOne || msg.sender == _playerTwo, "You are not playig this game.");
        _;
    }

    modifier onlyFactory() {
        require(factoryAddress == msg.sender, "Only the factory can call this function.");
        _;
    }

    function getBoard() external view returns (address lastPlayerToMove, int8[3][3] memory table) {
        lastPlayerToMove = board.lastPlayerToMove;
        table = board.table;
    }

    function setFactory(address _factoryAddress)
        onlyAtState(State.WaitingSetUp)
        onlyOwner
        external {
            factoryAddress = _factoryAddress;
            emit FactorySet(_factoryAddress);

            state = State.Closed;
            emit StateChanged("Closed");
        }   

    function init(address _playerOne, address _playerTwo)
        onlyFactory
        onlyAtState(State.Closed)
        external {

            playerOne = _playerOne;
            playerTwo = _playerTwo;

            board.lastPlayerToMove = address(0);
            board.table[0][0] = -1;
            board.table[0][1] = -1;
            board.table[0][2] = -1;
            board.table[1][0] = -1;
            board.table[1][1] = -1;
            board.table[1][2] = -1;
            board.table[2][0] = -1;
            board.table[2][1] = -1;
            board.table[2][2] = -1;

            emit GameInitialized();

            state = State.Playing;
            emit StateChanged("Playing");
        }

    // TODO: Check IFactory is called properly
    function checkWinner() internal {
        address winner = board.getWinner(playerOne, playerTwo);

        if (winner == address(1) || winner == playerOne || winner == playerTwo) {
            emit GameWon(winner);
            _notifyWinner(winner);
        }
    }

    function _notifyWinner(address _winner) 
        closeAfter()
        private {
            IFactory factory = IFactory(factoryAddress);
            factory.finish(_winner);
        }

    fallback() external {
        revert();
    }
}