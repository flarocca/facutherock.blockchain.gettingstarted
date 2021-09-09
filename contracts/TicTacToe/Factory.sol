// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "./FactoryFee.sol";
import "./TicTacToe.sol";
import "./Interfaces/IFactory.sol";
import "./Security.sol";

contract Factory is Security, FactoryFee, IFactory {

    address private constant EMPTY = address(0);
    address private constant DRAW = address(1);

    event GameCreated(address playerOne);
    event PlayerTwoJoined(address playerTwo);
    event GameStarted(address playerOne, address playerTwo);
    event GameFinished(address winner);
    event RewardClaimed(address player, uint reward);
    event Withdrew(uint balance);

    address public playerOne;
    address public playerTwo;
    address public gameAddress;
    address payable public winner;

    constructor(uint _initialFee, uint _initialBet, address _gameAddress) 
        FactoryFee(_initialFee, _initialBet) {
            require(_gameAddress != EMPTY, "Game address is required");

            gameAddress = _gameAddress;
        }

    function create(uint _bet)
        onlyAtState(FactoryState.AcceptingPlayerOne)
        onlyWhenValidBet(_bet) 
        external 
        payable {
            playerOne = msg.sender;

            state = FactoryState.AcceptingPlayerTwo;
            emit GameCreated(playerOne);
        }

    function join(uint _bet)
        onlyAtState(FactoryState.AcceptingPlayerTwo)
        onlyWhenValidBet(_bet)
        onlyWhenNotAlreadyPlaying(playerOne)
        external 
        payable {

            playerTwo = msg.sender;

            state = FactoryState.ReadyToStart;
            emit PlayerTwoJoined(playerTwo);
        }

    function start()
        onlyAtState(FactoryState.ReadyToStart)
        onlyPlayers(playerOne, playerTwo)
        external {
        
            require(playerOne != EMPTY && playerTwo != EMPTY, "The game needs two players to start");

            state = FactoryState.OnGoing;

            TicTacToe game = TicTacToe(gameAddress);
            game.init(playerOne, playerTwo);

            emit GameStarted(playerOne, playerTwo);
        }

    function finish(address _winner)
        onlyAtState(FactoryState.OnGoing)
        onlyGame(gameAddress)
        onlyAmongPlayers(_winner, playerOne, playerTwo) 
        override 
        external {
            winner = payable(_winner);
            state = FactoryState.Finished;

            emit GameFinished(winner);
        }

    function claimRewards()
        onlyAtState(FactoryState.Finished)
        onlyPlayers(playerOne, playerTwo)
        external {
            uint reward = address(this).balance - (fee * 2);

            if(winner != EMPTY) {
                _payWinner(reward);
            } else {
                _payPlayers(reward);
            }

            _payOwner();

            state = FactoryState.AcceptingPlayerOne;
            playerOne = EMPTY;
            playerTwo = EMPTY;
            winner = payable(EMPTY);
        }

    function _payWinner(uint reward) private {
        require(msg.sender == winner, "You are not the winner");

        winner.transfer(reward);
        emit RewardClaimed(winner, reward);
    }

    function _payPlayers(uint reward) private {
        uint sharedReward = reward / 2;

        payable(playerOne).transfer(sharedReward);
        emit RewardClaimed(playerOne, sharedReward);

        payable(playerTwo).transfer(sharedReward);
        emit RewardClaimed(playerTwo, sharedReward);
    }

    function _payOwner() private {
        uint balance = address(this).balance;
        payable(owner()).transfer(balance);

        emit Withdrew(balance);
    }
}