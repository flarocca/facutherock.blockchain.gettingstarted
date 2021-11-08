// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.7;

import "./Interfaces/IInitialCoinOffering.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract FacuTheRockICO is IInitialCoinOffering, ERC165 {

    uint private _price;
    uint private _offeringEndDate;
    address private _owner;
    IERC20 private _coin;

    constructor(uint _salePrice, address _address, uint _endDate) {
        _owner = msg.sender;
        _price = _salePrice;
        _coin = IERC20(_address);
        _offeringEndDate = _endDate;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IInitialCoinOffering).interfaceId || super.supportsInterface(interfaceId);
    }

    function buy(uint _amount) override external payable {
        require(block.timestamp <= _offeringEndDate, "OFFERING_CLOSED");
        require(msg.value == (_amount * _price), "INVALID_AMOUNT");
        require(_coin.balanceOf(address(this)) >= _amount, "NOT_ENOUGH_TOKENS_AVAILABLES");

        require(_coin.transfer(msg.sender, _amount));

        emit Sold(msg.sender, _amount);
    }

    function endOffering() override external {
        require(block.timestamp > _offeringEndDate, "OFFERING_IN_PROGRESS");
        
        require(_coin.transfer(_owner, _coin.balanceOf(address(this))));
        payable(_owner).transfer(address(this).balance);
    }
}