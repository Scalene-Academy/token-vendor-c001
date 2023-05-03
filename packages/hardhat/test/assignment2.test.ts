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
    yourToken = (await yourTokenFactory.deploy()) as YourToken;
    await yourToken.deployed();

    const vendorFactory = await ethers.getContractFactory("Vendor");
    vendor = (await vendorFactory.deploy(yourToken.address)) as Vendor;
    await vendor.deployed();

    console.log("    ⬇️  Transferring 1000 tokens to the vendor...");
    await yourToken.transfer(vendor.address, ethers.utils.parseEther("1000"));
  });

  describe("YourToken", function () {
    describe("totalSupply()", function () {
      it("Should have a total supply of 1000 on deployment", async function () {
        const totalSupply = await yourToken.totalSupply();
        const totalSupplyInt = parseInt(ethers.utils.formatEther(totalSupply));
        expect(totalSupplyInt).to.equal(1000);
      });
    });
  });

  describe("Vendor", function () {
    describe("buyTokens()", function () {
      it("Should let us buy tokens and our balance should go up", async function () {
        const startingBalance = await yourToken.balanceOf(owner.address);

        // buy 1 ETH worth of tokens (100 YourTokens)
        await vendor.buyTokens({ value: ethers.utils.parseEther("1") });

        const newBalance = await yourToken.balanceOf(owner.address);
        expect(newBalance).to.equal(startingBalance.add(ethers.utils.parseEther("100")));
      });

      it("Should not let us buy more tokens than the Vendor has", async function () {
        await expect(
          // buy 1010 tokens?
          vendor.buyTokens({ value: ethers.utils.parseEther("10.1") }),
        ).to.be.revertedWith(
          // nope!!
          "ERC20: transfer amount exceeds balance",
        );
      });
    });

    describe("sellTokens()", function () {
      it("Should let us sell tokens and we should get the correct amount of ETH back", async function () {
        const startingETHBalance = await ethers.provider.getBalance(owner.address);
        const startingBalance = await yourToken.balanceOf(owner.address);

        await yourToken.approve(vendor.address, ethers.utils.parseEther("0.1"));

        await vendor.sellTokens(ethers.utils.parseEther("0.1"));

        const newBalance = await yourToken.balanceOf(owner.address);

        expect(newBalance).to.equal(
          startingBalance.sub(ethers.utils.parseEther("0.1")),
          "Error when expecting the token balance to have increased by 0.1",
        );

        const newETHBalance = await ethers.provider.getBalance(owner.address);
        const ethChange = newETHBalance.sub(startingETHBalance).toNumber();
        expect(ethChange).to.greaterThan(100000000000000);
      });

      it("Should not allow us to sell more tokens than we have approved to be transferred", async function () {
        const startingAllowance = await yourToken.allowance(owner.address, vendor.address);
        // we should have approved 0 so far
        expect(startingAllowance).to.equal(0);

        await expect(vendor.sellTokens(ethers.utils.parseEther("0.1"))).to.be.revertedWith(
          "ERC20: insufficient allowance",
        );

        await yourToken.approve(vendor.address, ethers.utils.parseEther("0.1"));

        await expect(vendor.sellTokens(ethers.utils.parseEther("0.1"))).not.to.be.reverted;
      });

      it("Should not allow us to sell tokens if the Vendor doesn't have enough ETH to pay the user", async function () {
        // first, withdraw all the ETH
        await vendor.withdraw();

        // now, try to sell some tokens
        await yourToken.approve(vendor.address, ethers.utils.parseEther("0.1"));
        await expect(vendor.sellTokens(ethers.utils.parseEther("0.1"))).to.be.reverted;
      });
    });

    describe("withdraw()", function () {
      it("Should let the owner withdraw all the ETH from the contract", async function () {
        const vendorETHBalance = await ethers.provider.getBalance(vendor.address);

        const startingOwnerETHBalance = await ethers.provider.getBalance(owner.address);
        const withdrawResult = await vendor.withdraw();

        const newOwnerETHBalance = await ethers.provider.getBalance(owner.address);
        const tx = await ethers.provider.getTransaction(withdrawResult.hash);
        const receipt = await ethers.provider.getTransactionReceipt(withdrawResult.hash);
        const gasCost = tx.gasPrice?.mul(receipt.gasUsed);

        expect(newOwnerETHBalance).to.equal(
          startingOwnerETHBalance.add(vendorETHBalance).sub(ethers.BigNumber.from(gasCost)),
        );
      });

      it("Should not let anyone else withdraw the ETH from the contract", async function () {
        await expect(vendor.connect(nonOwner).withdraw()).to.be.reverted;
      });
    });
  });
});
