// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

abstract contract Security {

    modifier onlyGame(address _currentGame) {
        require(msg.sender == _currentGame, "Only the current game can call this function");
        _;
    }

    modifier onlyPlayers(address _playerOne, address _playerTwo) {
        require(msg.sender == _playerOne || msg.sender == _playerTwo, "You are not playig this game");
        _;
    }

    modifier onlyAmongPlayers(address _winner, address _playerOne, address _playerTwo) {
        require(_winner == _playerOne || _winner == _playerTwo, "Winner is not playig this game");
        _;
    }

    modifier onlyWhenNotAlreadyPlaying(address _playerOne) {
        require(msg.sender != _playerOne, "You are already playing this game");
        _;
    }
}