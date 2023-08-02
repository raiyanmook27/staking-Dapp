// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable2Step} from "openzeppelin-contracts/contracts/access/Ownable2Step.sol";
import {StakeDetails} from "./Structs.sol";
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

import "forge-std/Test.sol";

contract StakingContract is ERC20, Ownable2Step, Test {
    mapping(address => StakeDetails) public userStakes;
    uint256 public totalStakes;
    uint32 public lastTimeRewardsUpdated;
    address public tokenAddr;
    IERC20 public stoken;
    IERC20 public rToken;

    uint256 public accumulatedRewardPerToken;
    uint32 public duration = uint32(1 days);
    uint256 public rewardsPerSeconds = 1e17 / duration;

    event TokenStaked(address indexed user, uint256 _amount);
    event RewardsClaimed(address indexed user, uint256 _amount);

    constructor(
        address _stoken,
        address _rToken
    ) ERC20("Staked-Test Token", "STT") {
        stoken = IERC20(_stoken);
        rToken = IERC20(_rToken);
    }

    function stakeToken(uint256 _amount) external {
        require(_amount != 0, "Amount is Zero");
        require(
            stoken.transferFrom(msg.sender, address(this), _amount),
            "Transfer Failed"
        );
        updateRewards(msg.sender);

        userStakes[msg.sender] = StakeDetails({
            amount: _amount,
            rewardPaid: 0,
            totalRewards: 0
        });

        totalStakes += _amount;

        _mint(msg.sender, _amount);

        emit TokenStaked(msg.sender, _amount);
    }

    function updateRewards(address _user) public {
        //calculate reward per Token
        StakeDetails storage user = userStakes[_user];
        if (totalStakes == 0) {
            return;
        }

        if (block.timestamp > lastTimeRewardsUpdated) {
            accumulatedRewardPerToken += _accumulatedRewardPerToken();

            user.totalRewards += calcPendingRewards(_user);

            user.rewardPaid = accumulatedRewardPerToken;

            lastTimeRewardsUpdated = uint32(block.timestamp);
        }
    }

    function _accumulatedRewardPerToken() internal view returns (uint256) {
        if (totalStakes == 0) {
            return accumulatedRewardPerToken;
        }

        return
            accumulatedRewardPerToken +
            ((rewardsPerSeconds) *
                (_min(uint32(block.timestamp), duration) -
                    lastTimeRewardsUpdated) *
                1e18) /
            totalStakes;
    }

    function calcPendingRewards(
        address _user
    ) public view returns (uint256 pendingRewards) {
        StakeDetails memory user = userStakes[_user];

        pendingRewards =
            (user.amount * (_accumulatedRewardPerToken() - user.rewardPaid)) /
            1e18 +
            user.totalRewards;

        return pendingRewards;
    }

    function claimRewards() external {
        updateRewards(msg.sender);
        StakeDetails memory user = userStakes[msg.sender];
        uint256 rewards = user.rewardPaid;

        if (rewards == 0) return;

        uint256 rewardsBalance = rToken.balanceOf(address(this));
        require(rewardsBalance >= rewards, "Not enough rewards");

        userStakes[msg.sender].totalRewards = 0;

        require(rToken.transfer(msg.sender, rewards), "Transfer failed");

        emit RewardsClaimed(msg.sender, rewards);
    }

    function _min(
        uint32 time,
        uint32 finishedTime
    ) internal pure returns (uint32) {
        return time > finishedTime ? finishedTime : time;
    }
}
