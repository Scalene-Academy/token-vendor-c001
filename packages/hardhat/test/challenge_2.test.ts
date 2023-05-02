import { expect } from "chai";
import { ethers } from "hardhat";
import { YourToken, Vendor } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Token Vendor", function () {
  let owner: SignerWithAddress;
  let nonOwner: SignerWithAddress;

  let yourToken: YourToken;
  let vendor: Vendor;

  before(async () => {
    const signers = await ethers.getSigners();
    // use Hardhat Account #0 as the owner of the Vendor
    owner = signers[0];
    // use Hardhat Account #1 as a "non-owner"
    nonOwner = signers[1];

    // deploy the contracts
    const yourTokenFactory = await ethers.getContractFactory("YourToken");
    yourToken = (await yourTokenFactory.deploy(owner.address)) as YourToken;
    await yourToken.deployed();

    const vendorFactory = await ethers.getContractFactory("Vendor");
    vendor = (await vendorFactory.deploy(yourToken.address)) as Vendor;
    await vendor.deployed();

    console.log("Transferring 1000 tokens to the vendor...");
    await yourToken.transfer(vendor.address, ethers.utils.parseEther("1000"));
  });

  describe("YourToken", function () {
    describe("totalSupply()", function () {
      it("Should have a total supply of at least 1000", async function () {
        const totalSupply = await yourToken.totalSupply();
        const totalSupplyInt = parseInt(ethers.utils.formatEther(totalSupply));
        expect(totalSupplyInt).to.greaterThan(999);
      });
    });
  });

  describe("Vendor", function () {
    describe("buyTokens", function () {
      it("Should let us buy tokens and our balance should go up...", async function () {
        const startingBalance = await yourToken.balanceOf(owner.address);

        const buyTokensResult = await vendor.buyTokens({ value: ethers.utils.parseEther("0.001") });

        const txResult = await buyTokensResult.wait();
        expect(txResult.status).to.equal(1);

        const newBalance = await yourToken.balanceOf(owner.address);
        expect(newBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.1")));
      });
    });

    describe("sellTokens", function () {
      it("Should let us sell tokens and we should get the appropriate amount eth back...", async function () {
        const startingETHBalance = await ethers.provider.getBalance(owner.address);

        const startingBalance = await yourToken.balanceOf(owner.address);

        const approveTokensResult = await yourToken.approve(vendor.address, ethers.utils.parseEther("0.1"));

        const atxResult = await approveTokensResult.wait();
        expect(atxResult.status).to.equal(1, "Error when expecting the transaction result to equal 1");

        const sellTokensResult = await vendor.sellTokens(ethers.utils.parseEther("0.1"));

        const txResult = await sellTokensResult.wait();
        expect(txResult.status).to.equal(1, "Error when expecting the transaction status to equal 1");

        const newBalance = await yourToken.balanceOf(owner.address);
        expect(newBalance).to.equal(
          startingBalance.sub(ethers.utils.parseEther("0.1")),
          "Error when expecting the token balance to have increased by 0.1",
        );

        const newETHBalance = await ethers.provider.getBalance(owner.address);
        const ethChange = newETHBalance.sub(startingETHBalance).toNumber();
        expect(ethChange).to.greaterThan(
          100000000000000,
          "Error when expecting the ether returned to the user by the sellTokens function to be correct",
        );
      });
    });

    describe(" 💵 withdraw()", function () {
      it("Should let the owner (and nobody else) withdraw the eth from the contract...", async function () {
        const buyTokensResult = await vendor.connect(nonOwner).buyTokens({ value: ethers.utils.parseEther("0.1") });

        const buyTxResult = await buyTokensResult.wait();
        expect(buyTxResult.status).to.equal(1, "Error when expecting the transaction result to be 1");

        const vendorETHBalance = await ethers.provider.getBalance(vendor.address);

        const startingNonOwnerETHBalance = await ethers.provider.getBalance(nonOwner.address);

        await expect(vendor.connect(nonOwner).withdraw()).to.be.reverted;

        const newNonOwnerETHBalance = await ethers.provider.getBalance(nonOwner.address);
        expect(newNonOwnerETHBalance).to.be.lte(
          startingNonOwnerETHBalance,
          "Error when expecting the new eth balance to be <= to the previous balance after calling withdraw by a non owner",
        );

        const startingOwnerETHBalance = await ethers.provider.getBalance(owner.address);
        const withdrawResult = await vendor.withdraw();

        const withdrawTxResult = await withdrawResult.wait();
        expect(withdrawTxResult.status).to.equal(1, "Error when expecting the withdraw transaction to equal 1");

        const newOwnerETHBalance = await ethers.provider.getBalance(owner.address);

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
