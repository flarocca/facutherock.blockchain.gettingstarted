// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

import "./Interfaces/IERC20Minteable.sol";
import "./Interfaces/IERC20Burneable.sol";

contract FacuTheRockCoin is IERC20Minteable, IERC20Burneable {

    string public constant name = "FacuTheRockCoin";
    string public constant symbol = "FTR";
    uint8 public constant decimals = 10;

    uint private _totalSupply;
    mapping(address => uint) private _balances;
    mapping(address => mapping(address => uint)) private _allowance;
    mapping(address => uint) private _minted;
    mapping(address => uint) private _cooldown;

    constructor(uint _initialSupply) {
        require(_initialSupply > 0, "INVALID_TOTAL_SUPPLY");

        _totalSupply = _initialSupply * (10 ** decimals);
        _balances[msg.sender] = _totalSupply;
    }

    function totalSupply() override external view returns (uint) {
        return _totalSupply;
    }

    function balanceOf(address account) override external view returns (uint) {
        return _balances[account];
    }

    function allowance(address owner, address spender) override external view returns (uint) {
        return _allowance[owner][spender];
    }

    function minted(address owner) override external view returns (uint) {
        return _minted[owner];
    }

    function cooldown(address owner) override external view returns (uint) {
        return _cooldown[owner];
    }

    function transfer(address recipient, uint amount) override external returns (bool) {
        require(recipient != address(0), "EMPTY_ADDRESS_NOT_ALLOWED");
        require(amount > 0, "INVALID_AMOUNT");
        require(_balances[msg.sender] >= amount, "INSUFFICIENT_FUNDS");

        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;

        emit Transfer(msg.sender, recipient, amount);

        return true;
    }

    function approve(address spender, uint amount) override external returns (bool) {
        uint currentAllowance = _allowance[msg.sender][spender];
        _allowance[msg.sender][spender] = currentAllowance + amount;

        emit Approval(msg.sender, spender, currentAllowance + amount);

        return true;
    }

    function transferFrom(address sender, address recipient, uint amount) override external returns (bool) {
        require(sender != address(0), "EMPTY_ADDRESS_NOT_ALLOWED");
        require(recipient != address(0), "EMPTY_ADDRESS_NOT_ALLOWED");
        require(amount > 0, "INVALID_AMOUNT");

        uint allowed = _allowance[sender][msg.sender];

        require(allowed >= amount, "AMOUNT_EXCEEDS_ALLOWANCE");

        _balances[sender] -= amount;
        _allowance[sender][msg.sender] = allowed - amount;
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);

        return true;
    }

    function mint() external returns (bool) {
        require(block.timestamp >= (_cooldown[msg.sender] + 1 weeks), "COOLDOWN_PERIOD_IN_PROGRESS");

        uint BASE_DECIMALS = (10 ** decimals);

        uint mintedTokens = _minted[msg.sender];
        uint balance = _balances[msg.sender];

        if(mintedTokens > 0) {
            require((balance - (mintedTokens * 10)) >= (10 * BASE_DECIMALS), "INSUFFICIENT_FUNDS");
        }

        uint amount = 1 * BASE_DECIMALS;

        _totalSupply += amount;
        _balances[msg.sender] += amount;
        _minted[msg.sender] += amount;
        _cooldown[msg.sender] = block.timestamp;

        emit Transfer(address(0), msg.sender, amount);

        return true;
    }

    function burn(uint amount) override external returns (bool) {
        require(amount > 0, "INVALID_AMOUNT");

        uint currentBalance = _balances[msg.sender];

        require(currentBalance >= amount, "INSUFFICIENT_FUNDS");

        _balances[msg.sender] = currentBalance - amount;

        emit Transfer(msg.sender, address(0), amount);

        return true;
    }
}