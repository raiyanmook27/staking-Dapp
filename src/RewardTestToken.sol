// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable2Step} from "openzeppelin-contracts/contracts/access/Ownable2Step.sol";
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract RewardTestToken is ERC20, Ownable2Step {
    constructor() ERC20("RewardTEST Token", "RTT") {
        _mint(msg.sender, 10000e18);
    }
}
