// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ITicTacToeFactory {
    function setWinner(address payable winner) external;

    function setDraw() external;
}