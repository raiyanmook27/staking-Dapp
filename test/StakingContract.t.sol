// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {StakingContract} from "../src/StakingContract.sol";
import {TestToken} from "../src/TestToken.sol";
import {RewardTestToken} from "../src/RewardTestToken.sol";

contract StakingTest is Test {
    StakingContract public staking;
    TestToken public token;
    RewardTestToken public rToken;

    address constant _OWNER = address(0x123);
    address constant _USER = address(0x20);

    function setUp() public {
        vm.startPrank(_OWNER);
        token = new TestToken();
        rToken = new RewardTestToken();
        staking = new StakingContract(address(token), address(rToken));

        //transfer token to amount
        token.transfer(_USER, 1000e18);
        rToken.transfer(address(staking), 1000e18);
        vm.stopPrank();
    }

    function testStake() public {
        vm.startPrank(_USER);
        token.approve(address(staking), 1000e18);
        staking.stakeToken(1000e18);

        console.log("pending rewards", staking.calcPendingRewards(_USER));

        skip(11 seconds);

        staking.claimRewards();

        console.log("Rewards Token balance", rToken.balanceOf(_USER));

        skip(11 seconds);
        console.log("pending rewards", staking.calcPendingRewards(_USER));

        vm.stopPrank();
    }
}
