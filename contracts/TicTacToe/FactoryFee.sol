// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "./FactoryStateMachine.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract FactoryFee is FactoryStateMachine, Ownable {
    
    // TODO: Eternal storage
    uint public fee;
    uint public bet;

    modifier onlyWhenValidBet(uint _bet) {
        require(msg.value == _bet && msg.value == bet, "Ether sent does not match the bet required");
        _;
    }

    constructor(uint _initialFee, uint _initialBet) 
        Ownable() {
            require(_initialFee > 0, "Initial Fee must be greater than zero.");
            require(_initialBet > 0, "Initial Bet must be greater than zero.");

            fee = _initialFee;
            bet = _initialBet;
        }

    function updateFee(uint newFee)
        onlyOwner
        onlyAtState(FactoryState.AcceptingPlayerOne)
        external {
            fee = newFee;
        }

    function updateBet(uint newBet) 
        onlyOwner
        onlyAtState(FactoryState.AcceptingPlayerOne)
        external {
            bet = newBet;
        }
}