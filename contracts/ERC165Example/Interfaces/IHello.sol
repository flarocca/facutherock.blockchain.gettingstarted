// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

interface IHello {
    function hello(string memory user)
        external pure returns (string memory);
}