import "./staking.css";
import { BrowserProvider, ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useNetwork } from "wagmi";
import { useState, useCallback, useEffect, useMemo } from "react";
import StakingContract from "./abis/StakingContract.json";
import RewardTestToken from "./abis/RewardTestToken.json";
import TestToken from "./abis/TestToken.json";
import { testToken, rewardToken, stakingContractAddress } from "./constants";
import OverlayAlert from "./OverlayAlert";

export default function Staking() {
  const { address: userAddress } = useAccount();
  const { chain } = useNetwork();
  const [stakeAmount, setStakeAmount] = useState(0n);
  const [pendingRewards, setPendingRewards] = useState(0n);
  const [testTokenBalance, setTestTokenBalance] = useState(0n);
  const [rewardTokenBalance, setRewardTokenBalance] = useState(0n);
  const [rewards, setRewards] = useState("0");
  //const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [stakedTokenBalance, setStakedTokenBalance] = useState(0n);
  const provider = new BrowserProvider(window.ethereum);

  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = () => {
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // function getCurrentTime() {
  //   const currentTime = new Date();
  //   const hours = currentTime.getHours().toString().padStart(2, "0");
  //   const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  //   const seconds = currentTime.getSeconds().toString().padStart(2, "0");
  //   return `${hours}:${minutes}:${seconds}`;
  // }

  const getPendingRewards = useCallback(async () => {
    const stakingContract = new ethers.Contract(
      stakingContractAddress,
      StakingContract,
      provider
    );

    try {
      const penRewards = await stakingContract.calcPendingRewards(userAddress);
      setPendingRewards(penRewards.toString());
      console.log("Pending Rewards:", penRewards);
    } catch (error) {
      console.log("Pending Rewards error", error);
    }
  }, [userAddress /*getCurrentTime*/]);

  const getTestTokenBalance = useCallback(async () => {
    const testTokenCon = new ethers.Contract(testToken, TestToken, provider);

    try {
      const balance = await testTokenCon.balanceOf(userAddress);
      setTestTokenBalance(balance.toString());
      console.log("Test Token Balance: ", balance);
    } catch (error) {
      console.log("Test balance error", error);
    }
  }, [userAddress]);

  const getRewardTestToken = useCallback(async () => {
    const rewardCon = new ethers.Contract(
      rewardToken,
      RewardTestToken,
      provider
    );

    try {
      const balance = await rewardCon.balanceOf(userAddress);
      console.log("Reward Balance: ", balance);
      setRewardTokenBalance(balance.toString());
    } catch (error) {
      console.log("Error", error);
    }
  }, [userAddress]);

  const getStakedTokenBalance = useCallback(async () => {
    const stakedCon = new ethers.Contract(
      stakingContractAddress,
      StakingContract,
      provider
    );

    const balance = await stakedCon.balanceOf(userAddress);
    console.log("Staked-Token:", balance);

    setStakedTokenBalance(balance.toString());

    try {
    } catch (error) {
      console.log("Error", error);
    }
  }, [userAddress]);

  const handleStakeTokens = async () => {
    //connect to blockchain node
    const signer = await provider.getSigner();
    try {
      const stakingContract = new ethers.Contract(
        stakingContractAddress,
        StakingContract,
        signer
      );
      const testTokenCon = new ethers.Contract(testToken, TestToken, signer);

      //estimate gas
      const parsedStakeAmount = ethers.parseEther(stakeAmount);
      console.log("Stake Amount", parsedStakeAmount);

      //approval
      const allowance = await testTokenCon.allowance(
        userAddress,
        stakingContractAddress
      );

      if (allowance < parsedStakeAmount) {
        try {
          const tx = await testTokenCon.approve(
            stakingContractAddress,
            parsedStakeAmount
          );

          console.log("Transaction details :", await tx.wait());
        } catch (error) {
          console.log("Approval Error", error);
        }
      }

      try {
        const gas = await stakingContract.stakeToken.estimateGas(
          parsedStakeAmount
        );

        console.log("Gas estimate: ", ethers.parseEther(gas.toString()));
      } catch (error) {
        console.log("Gas estimate: ", error);
      }

      const tx = await stakingContract.stakeToken(parsedStakeAmount);

      const receipt = await tx.wait();

      await getTestTokenBalance();

      setStakeAmount("0.0");

      console.log("Transaction Receipts: ", receipt);
    } catch (error) {
      console.log(error);
    }
  };

  const onHandleOnChangedAmount = useCallback((e) => {
    const value = e?.target?.value?.toString();
    console.log(value);
    setStakeAmount(value);
  }, []);

  const handleClaimRewards = async () => {
    const stakingContract = new ethers.Contract(
      stakingContractAddress,
      StakingContract,
      await provider.getSigner()
    );

    try {
      const tx = await stakingContract.claimRewards();

      const recpt = await tx.wait();

      console.log("Transaction Receipt", recpt);

      getRewardTestToken();
    } catch (error) {
      console.log("Error claiming rewards", error);
    }
  };

  //useEffects
  useEffect(() => {
    getTestTokenBalance();
  }, [userAddress]);

  useEffect(() => {
    getPendingRewards();
  }, [userAddress /*currentTime]*/]);

  useEffect(() => {
    getRewardTestToken();
  }, [userAddress]);

  useEffect(() => {
    getStakedTokenBalance();
  }, [userAddress]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTime(getCurrentTime());
  //   }, 1000); // Update the time every 1 second (1000 milliseconds)

  //   // Clear the interval when the component is unmounted
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>Stake Test Tokens</h1>
        <ConnectButton />
      </div>
      <div className="input-group">
        <input
          placeholder="stake amount"
          value={stakeAmount}
          onChange={onHandleOnChangedAmount}
        />
        <button onClick={handleStakeTokens}>Stake</button>
      </div>
      <div className="input-group">
        <button className="secondary" onClick={handleClaimRewards}>
          Claim Rewards
        </button>
      </div>
      <h3>User Information:</h3>
      <p>Pending Rewards: {pendingRewards}</p>
      <p>User Test Token Balance: {testTokenBalance}</p>
      <p>User RewardTestToken Balance: {rewardTokenBalance}</p>
      <p>User Staked Token Balance: {stakedTokenBalance}</p>
    </div>
  );
}
