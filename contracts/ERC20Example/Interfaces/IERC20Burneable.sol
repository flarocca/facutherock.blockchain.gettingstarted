// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

import "./IERC20.sol";

interface IERC20Burneable is IERC20 {
    
    function burn(uint amount) external returns (bool);
}