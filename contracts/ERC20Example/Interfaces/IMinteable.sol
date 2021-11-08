// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

interface IMinteable {
    
    function minted(address owner) external view returns (uint);

    function cooldown(address owner) external view returns (uint);
}