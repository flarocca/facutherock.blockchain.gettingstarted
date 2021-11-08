// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

interface IInitialCoinOffering {
    function buy(uint _amount) external payable;

    function endOffering() external;

    event Sold(address buyer, uint amount);
}