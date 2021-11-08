// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

interface IBurneable {
    
    function burn(uint amount) external returns (bool);
}