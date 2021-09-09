// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

interface IGreeting {
    function greeting(string memory user)
        external pure returns (string memory);
}