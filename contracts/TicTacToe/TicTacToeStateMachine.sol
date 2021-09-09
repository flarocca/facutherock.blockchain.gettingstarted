// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

abstract contract TicTacToeStateMachine {
    enum State {
        WaitingSetUp,
        Closed,
        Playing
    }

    State public state = State.WaitingSetUp;
    uint public initiationTime = block.timestamp;

    modifier onlyAtState(State _state) {
        require(state == _state, "This action cannot be executed at this state");
        _;
    }

    modifier closeAfter() {
        _;
        state = State.Closed;
    }
}