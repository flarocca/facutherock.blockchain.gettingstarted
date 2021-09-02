pragma solidity ^0.8.7;

import "./Interfaces/IGreeting.sol";
import "./Interfaces/IHello.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/introspection/ERC165Checker.sol";

contract ConsumerContract {
    using ERC165Checker for address;
    
    IGreeting private greetingContract;
    IHello private helloContract;
    
    constructor(address _greetingAddress, address _helloAddress) public {
        bool implementsERC165 = _greetingAddress.supportsInterface(type(IGreeting).interfaceId);
        bool doesNotImplementERC165 = _helloAddress.supportsInterface(type(IHello).interfaceId);
        
        require(implementsERC165, "1- Contract does not support interface"); // Should work
        require(doesNotImplementERC165, "2- Contract does not support interface"); // Should fail
    }
}