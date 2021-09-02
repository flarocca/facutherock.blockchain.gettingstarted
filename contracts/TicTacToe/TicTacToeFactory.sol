// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./TicTacToeFee.sol";
import "./TicTacToe.sol";
import "./Interfaces/ITicTacToeFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicTacToeFactory is TicTacToeFee, ITicTacToeFactory {

    address private playerOne;
    address private playerTwo;
    address private currentGame;

    modifier onlyGame() {
        require(msg.sender == currentGame);
        _;
    }

    modifier onlyPlayers(address winner) {
        require(winner == playerOne || winner == playerTwo, "You are not playig this game");
        _;
    }

    constructor(uint _initialFee, uint _initialBet) 
        TicTacToeFee(_initialFee, _initialBet) {

    }

    function createNewGame(uint _bet) onlyWhenValidBet(_bet) external payable {
        playerOne = msg.sender;
    }

    function joinPlayer(uint _bet) onlyWhenValidBet(_bet) external payable {
        require(msg.sender != playerOne, "You are already playing this game.");

        playerTwo = msg.sender;
    }

    function startNewGame() external returns (address) {
        require(msg.sender == playerOne || msg.sender == playerTwo, "You are not playing this game.");
        require(playerOne != address(0) && playerTwo != address(0), "The game needs two players to start.");

        currentGame = address(new TicTacToe(playerOne, playerTwo));

        return currentGame;
    }

    function setWinner(address payable winner) onlyGame onlyPlayers(winner) override external {
        uint reward = address(this).balance - fee;
        address payable owner = payable(address(owner()));

        winner.transfer(reward);
        owner.transfer(address(this).balance);

        _closeGame();
    }

    function setDraw() onlyGame override external {
        uint reward = address(this).balance - fee;
        address payable owner = payable(address(owner()));
        
        payable(playerOne).transfer(reward / 2);
        payable(playerTwo).transfer(reward / 2);

        owner.transfer(address(this).balance);

        _closeGame();
    }

    function _closeGame() private {
        playerOne = address(0);
        playerTwo = address(0);
        currentGame = address(0);
    }
}