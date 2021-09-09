// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "./Interfaces/IERC165.sol";

abstract contract ERC165Implementation is IERC165 {
    
    mapping(bytes4 => bool) internal supportedInterfaces;
    
    constructor() {
        supportedInterfaces[this.supportsInterface.selector] = true;
    }
    
    function supportsInterface(bytes4 interfaceID) override external view returns (bool) {
        return supportedInterfaces[interfaceID];
    }
}