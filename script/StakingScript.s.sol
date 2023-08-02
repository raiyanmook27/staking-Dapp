// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import {StakingContract} from "../../src/StakingContract.sol";
import {TestToken} from "../../src/TestToken.sol";
import {RewardTestToken} from "../../src/RewardTestToken.sol";

contract StakingScript is Script {
    StakingContract public staking;
    TestToken public sToken;
    RewardTestToken public rToken;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        sToken = new TestToken();
        rToken = new RewardTestToken();

        new StakingContract(address(sToken), address(rToken));
    }
}
