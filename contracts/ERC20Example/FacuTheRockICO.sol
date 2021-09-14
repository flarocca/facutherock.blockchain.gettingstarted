// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

import "./Interfaces/IERC20.sol";

contract FacuTheRockICO {

    event Sold(address buyer, uint amount);

    address private _owner;
    uint private _price;
    IERC20 private _coin;
    uint private _offeringEndDate;

    constructor(uint _salePrice, address _address, uint _endDate) {
        _owner = msg.sender;
        _price = _salePrice;
        _coin = IERC20(_address);
        _offeringEndDate = _endDate;
    }

    function buy(uint _amount) external payable {
        require(block.timestamp <= _offeringEndDate, "Offering is closed");
        require(msg.value == (_amount * _price), "Invalid value sent");
        require(_coin.balanceOf(address(this)) >= _amount, "Not enough available tokens");

        require(_coin.transfer(msg.sender, _amount));

        emit Sold(msg.sender, _amount);
    }

    function endOffering() external {
        require(block.timestamp > _offeringEndDate, "Offering is still in progress");
        
        require(_coin.transfer(_owner, _coin.balanceOf(address(this))));
        payable(_owner).transfer(address(this).balance);
    }
}