import { expect } from "chai";
import { ethers } from "hardhat";
import { YourToken, Vendor } from "../typechain-types";

describe("🚩 Challenge 2: 🏵 Token Vendor 🤖", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourToken: YourToken;
  let vendor: Vendor;

  before(async () => {
    const [owner] = await ethers.getSigners();
    const yourTokenFactory = await ethers.getContractFactory("YourToken");
    yourToken = (await yourTokenFactory.deploy(owner.address)) as YourToken;
    await yourToken.deployed();

    const vendorFactory = await ethers.getContractFactory("Vendor");
    vendor = (await vendorFactory.deploy(yourToken.address)) as Vendor;
    await vendor.deployed();

    console.log("Transferring 1000 tokens to the vendor...");
    await yourToken.transfer(vendor.address, ethers.utils.parseEther("1000"));
  });
  // @ALLAN add these tests

  describe("YourToken", function () {
    describe("totalSupply()", function () {
      it("Should have a total supply of at least 1000", async function () {
        const totalSupply = await yourToken.totalSupply();
        const totalSupplyInt = parseInt(ethers.utils.formatEther(totalSupply));
        console.log("\t", " 🧾 Total Supply:", totalSupplyInt);
        expect(totalSupplyInt).to.greaterThan(999);
      });
    });
  });

  describe("Vendor", function () {
    describe(" 💵 buyTokens()", function () {
      it("Should let us buy tokens and our balance should go up...", async function () {
        const [owner] = await ethers.getSigners();
        console.log("\t", " 🧑 Tester Address: ", owner.address);

        const startingBalance = await yourToken.balanceOf(owner.address);
        console.log("\t", " ⚖  Starting Token balance: ", ethers.utils.formatEther(startingBalance));

        console.log("\t", " 💸 Buying...");
        const buyTokensResult = await vendor.buyTokens({ value: ethers.utils.parseEther("0.001") });
        console.log("\t", " 🏷  buyTokens Result: ", buyTokensResult.hash);

        console.log("\t", " ⏳ Waiting for confirmation...");
        const txResult = await buyTokensResult.wait();
        expect(txResult.status).to.equal(1);

        const newBalance = await yourToken.balanceOf(owner.address);
        console.log("\t", " 🔎 New Token balance: ", ethers.utils.formatEther(newBalance));
        expect(newBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.1")));
      });
    });

    describe(" 💵 sellTokens()", function () {
      it("Should let us sell tokens and we should get the appropriate amount eth back...", async function () {
        const [owner] = await ethers.getSigners();

        const startingETHBalance = await ethers.provider.getBalance(owner.address);
        console.log("\t", " ⚖  Starting ETH balance: ", ethers.utils.formatEther(startingETHBalance));

        const startingBalance = await yourToken.balanceOf(owner.address);
        console.log("\t", " ⚖  Starting Token balance: ", ethers.utils.formatEther(startingBalance));

        console.log("\t", " 🙄 Approving...");
        const approveTokensResult = await yourToken.approve(vendor.address, ethers.utils.parseEther("0.1"));
        console.log("\t", " 🏷  approveTokens Result: ", approveTokensResult.hash);

        console.log("\t", " ⏳ Waiting for confirmation...");
        const atxResult = await approveTokensResult.wait();
        expect(atxResult.status).to.equal(1, "Error when expecting the transaction result to equal 1");

        console.log("\t", " 🍾 Selling...");
        const sellTokensResult = await vendor.sellTokens(ethers.utils.parseEther("0.1"));
        console.log("\t", " 🏷  sellTokens Result: ", sellTokensResult.hash);

        console.log("\t", " ⏳ Waiting for confirmation...");
        const txResult = await sellTokensResult.wait();
        expect(txResult.status).to.equal(1, "Error when expecting the transaction status to equal 1");

        const newBalance = await yourToken.balanceOf(owner.address);
        console.log("\t", " 🔎 New Token balance: ", ethers.utils.formatEther(newBalance));
        expect(newBalance).to.equal(
          startingBalance.sub(ethers.utils.parseEther("0.1")),
          "Error when expecting the token balance to have increased by 0.1",
        );

        const newETHBalance = await ethers.provider.getBalance(owner.address);
        console.log("\t", " 🔎 New ETH balance: ", ethers.utils.formatEther(newETHBalance));
        const ethChange = newETHBalance.sub(startingETHBalance).toNumber();
        expect(ethChange).to.greaterThan(
          100000000000000,
          "Error when expecting the ether returned to the user by the sellTokens function to be correct",
        );
      });
    });

    describe(" 💵 withdraw()", function () {
      it("Should let the owner (and nobody else) withdraw the eth from the contract...", async function () {
        const [owner, nonOwner] = await ethers.getSigners();

        console.log("\t", " 💸 Buying some tokens...");
        const buyTokensResult = await vendor.connect(nonOwner).buyTokens({ value: ethers.utils.parseEther("0.1") });
        console.log("\t", " 🏷  buyTokens Result: ", buyTokensResult.hash);

        console.log("\t", " ⏳ Waiting for confirmation...");
        const buyTxResult = await buyTokensResult.wait();
        expect(buyTxResult.status).to.equal(1, "Error when expecting the transaction result to be 1");

        const vendorETHBalance = await ethers.provider.getBalance(vendor.address);
        console.log("\t", " ⚖  Starting Vendor contract ETH balance: ", ethers.utils.formatEther(vendorETHBalance));

        console.log("\t", " 🍾 Withdrawing as non-owner (should fail)...");
        const startingNonOwnerETHBalance = await ethers.provider.getBalance(nonOwner.address);
        console.log("\t", " ⚖  Starting non-owner ETH balance: ", ethers.utils.formatEther(startingNonOwnerETHBalance));

        await expect(vendor.connect(nonOwner).withdraw()).to.be.reverted;
        console.log("\t", " 🏷  withdraw reverted as non-owner");

        const newNonOwnerETHBalance = await ethers.provider.getBalance(nonOwner.address);
        console.log("\t", " 🔎 New non-owner ETH balance: ", ethers.utils.formatEther(newNonOwnerETHBalance));
        expect(newNonOwnerETHBalance).to.be.lte(
          startingNonOwnerETHBalance,
          "Error when expecting the new eth balance to be <= to the previous balance after calling withdraw by a non owner",
        );

        console.log("\t", " 🍾 Withdrawing as owner...");
        const startingOwnerETHBalance = await ethers.provider.getBalance(owner.address);
        console.log("\t", " ⚖  Starting owner ETH balance: ", ethers.utils.formatEther(startingOwnerETHBalance));
        const withdrawResult = await vendor.withdraw();
        console.log("\t", " 🏷  withdraw Result: ", withdrawResult.hash);

        console.log("\t", " ⏳ Waiting for confirmation...");
        const withdrawTxResult = await withdrawResult.wait();
        expect(withdrawTxResult.status).to.equal(1, "Error when expecting the withdraw transaction to equal 1");

        const newOwnerETHBalance = await ethers.provider.getBalance(owner.address);
        console.log("\t", " 🔎 New owner ETH balance: ", ethers.utils.formatEther(newOwnerETHBalance));

        const tx = await ethers.provider.getTransaction(withdrawResult.hash);
        const receipt = await ethers.provider.getTransactionReceipt(withdrawResult.hash);
        const gasCost = tx.gasPrice?.mul(receipt.gasUsed);

        expect(newOwnerETHBalance).to.equal(
          startingOwnerETHBalance.add(vendorETHBalance).sub(ethers.BigNumber.from(gasCost)),
          "Error when expecting the owner's ether returned by withdraw to be sufficient",
        );
      });
    });
  });
});
