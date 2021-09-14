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

    // TODO: Implement eternal storage
    FactoryState public state = FactoryState.AcceptingPlayerOne;
    // TODO: Close the game automatically after some time
    uint public initiationTime = block.timestamp;

    modifier onlyAtState(FactoryState _state) {
        require(state == _state, "This action cannot be executed at this state");
        _;
    }
}