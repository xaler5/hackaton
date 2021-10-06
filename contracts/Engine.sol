// SPDX-License-Identifier: MIT

pragma solidity <0.7.0;

import "./UUPSImplementation.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

contract Engine is UUPSImplementation, Initializable {
    
    function initialize() external initializer {
        _upgrader = msg.sender;
    }
    
}