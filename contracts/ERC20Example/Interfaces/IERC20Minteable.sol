// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

import "./IERC20.sol";

interface IERC20Minteable is IERC20 {
    
    function minted(address owner) external view returns (uint);

    function cooldown(address owner) external view returns (uint);
}