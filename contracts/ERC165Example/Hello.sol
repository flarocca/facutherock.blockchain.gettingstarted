// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "./Interfaces/IHello.sol";

contract Hello is IHello {

    function hello(string memory user)
        override external pure returns (string memory) {
            return string(abi.encodePacked("Hello ", user, "!!!"));
        }
}