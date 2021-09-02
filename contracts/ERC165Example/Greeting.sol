pragma solidity ^0.8.7;

import "./Iterfaces/IGreeting.sol";
import "./ERC165Implementation.sol";

contract Greeting is ERC165Implementation, IGreeting {
    
    constructor() ERC165Implementation() public {
        supportedInterfaces[this.greeting.selector] = true;
    }

    function greeting(string memory user)
        override external pure returns (string memory) {
            return string(abi.encodePacked("Hello ", user, "!!!"));
        }
}