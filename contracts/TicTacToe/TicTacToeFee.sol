// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract TicTacToeFee is Ownable{
    
    uint internal fee;
    uint internal bet;

    modifier onlyWhenValidBet(uint _bet) {
        require(msg.value == _bet && msg.value == bet, "Ether sent does not match the bet required");
        _;
    }

    constructor(uint _initialFee, uint _initialBet) Ownable() {
        fee = _initialFee;
        bet = _initialBet;
    }

    function updateFee(uint newFee) onlyOwner external {
        fee = newFee;
    }

    function updateBet(uint newBet) onlyOwner external {
        bet = newBet;
    }

    function getFee() view external returns (uint) {
        return fee;
    }

    function getBet() view external returns (uint) {
        return bet;
    }
}