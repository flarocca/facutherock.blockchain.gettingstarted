// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

abstract contract FactoryStateMachine {
    enum FactoryState {
        AcceptingPlayerOne,
        AcceptingPlayerTwo,
        ReadyToStart,
        OnGoing,
        Finished,
        Paid
    }

    FactoryState public state = FactoryState.AcceptingPlayerOne;
    uint public initiationTime = block.timestamp; //internal

    modifier onlyAtState(FactoryState _state) {
        require(state == _state, "This action cannot be executed at this state");
        _;
    }
}