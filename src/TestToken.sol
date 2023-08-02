// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

import {Ownable2Step} from "openzeppelin-contracts/contracts/access/Ownable2Step.sol";

contract TestToken is ERC20, Ownable2Step {
    constructor() ERC20("TEST Token", "TT") {
        _mint(msg.sender, 10000e18);
    }
}
