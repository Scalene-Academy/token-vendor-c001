## 🏵 Token Vendor 🤖

> 🤖 Smart contracts are kind of like "always on" _vending machines_ that **anyone** can access. Let's make a decentralized, digital currency. Then, let's build an unstoppable vending machine that will buy and sell the currency. We'll learn about the "approve" pattern for ERC20s and how contract to contract interactions work.

### You will

- 🏵 Create a `YourToken.sol` token contract that inherits the **ERC20** token standard from OpenZeppelin. Set your token to `_mint()` **1000** (\* 10 \*\* 18) tokens to the `msg.sender`.

- 🤖 Create a `Vendor.sol` contract that sells and buys your tokens

- 🎛 Extension: Edit the frontend that invites the user to `<input\>` an amount of tokens they want to buy. We'll display a preview of the amount of ETH it will cost.

🧫 Everything starts by ✏️ Editing `YourToken.sol` in `packages/hardhat/contracts`

---

### Requirements

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)
  - `yarn` is an **alternative** to `npm`, please do not use any `npm` commands for this assignment!

---

### Checkpoint 0: Clone and Install

```
git clone git@github.com:Scalene-Academy/token-vendor-c1.git
cd token-vendor-c1
yarn install
```

### Checkpoint 1: 🔭 Environment 📺

You'll have three terminals up for:

```
yarn chain   (local hardhat network)
yarn start   (nextjs frontend)
yarn deploy  (to compile, deploy, and publish your contracts to the hardhat network, which will reflect on your frontend)
```

> 👀 Visit your frontend at http://localhost:3000. To start, we'll be using the `Debug Contracts` tab

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to redeploy your contracts

> Ignore any errors or warnings for now, we'll get to that...

---

### Checkpoint 2: 🏵Your Token 💵

- 👩‍💻 Edit `YourToken.sol` to inherit the **ERC20** token standard from OpenZeppelin

- Mint **1000** (\* 10 \*\* 18) to your frontend address using the `constructor()`.

  - (Your frontend address is the address in the top right of http://localhost:3000)

> Remember, you can `yarn deploy --reset` to redeploy your contracts until you get it right.

#### 🥅 Goals

- [ ] Can you check the `balanceOf()` your frontend address?
- [ ] Can you `transfer()` your token to another account and check _that_ account's `balanceOf`?

---

### Checkpoint 3: ⚖️ Vendor 🤖

- 👩‍💻 Edit the `Vendor.sol` contract with a **payable** `buyTokens()` function
- Use a price variable named `tokensPerEth` set to **100**:

  ```solidity
  uint256 public constant tokensPerEth = 100;
  ```

- 📝 The `buyTokens()` function in `Vendor.sol` should use `msg.value` and `tokensPerEth` to calculate an amount of tokens to `yourToken.transfer()` to `msg.sender`.
- 📟 Define and `emit` an **event** `BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens)` when tokens are purchased.
- Edit `deploy/01_deploy_vendor.js` to deploy the `Vendor` (uncomment Vendor deploy lines).
- When you try to buy tokens from the vendor, you should get an error: **'ERC20: transfer amount exceeds balance'**

- ⚠️ This is because the Vendor contract doesn't have any `YourToken`s yet!

- ⚔️ Side Quest: send tokens from your frontend address to the Vendor contract address and _then_ try to buy them.

- ✏️ We can't hard code the vendor address like we did above when deploying to the network because we won't know the vendor address at the time we create the token contract.

- ✏️ So instead, edit `YourToken.sol` to mint the tokens to the `msg.sender` (deployer) in the `constructor(address deployer)`.

- ✏️ Then, edit `deploy/01_deploy_vendor.js` to transfer 1000 tokens to `vendor.address`.

  ```js
  await yourToken.transfer(vendor.address, ethers.utils.parseEther("1000"));
  ```

> Remember, you can `yarn deploy --reset` to redeploy your contracts until you get it right.

#### 🥅 Goals

- [ ] Does the `Vendor` address start with a `balanceOf` **1000** in `YourToken` on the `Debug Contracts` tab?
- [ ] Can you buy **10** tokens for **0.1** ETH?
- [ ] Can you transfer tokens to a different account?

### Checkpoint 4: Become the Owner 🕴

- 📝 Edit `Vendor.sol` to inherit _Ownable_.

- In `deploy/01_deploy_vendor.js` you will need to call `transferOwnership()` on the `Vendor` to make _your frontend address_ the `owner`:

  ```js
  await vendor.transferOwnership("**YOUR FRONTEND ADDRESS**");
  ```

- 📝 Finally, add a `withdraw()` function in `Vendor.sol` that only allows the owner to withdraw ETH from the vendor.

#### 🥅 Goals

- [ ] Is your frontend address the `owner` of the `Vendor`?
- [ ] Can **only** the `owner` withdraw the ETH from the `Vendor`?

---

### Checkpoint 5: 🤔 Vendor Buyback 🤯

👩‍🏫 The hardest part of this assignment is to build your `Vendor` to buy the tokens back.

🧐 The reason why this is hard is the `approve()` pattern in ERC20s.

😕 First, the user has to call `approve()` on the `YourToken` contract, approving the `Vendor` contract address to take some amount of tokens.

🤨 Then, the user makes a _second transaction_ to the `Vendor` contract to `sellTokens(uint256 amount)`.

🤓 The `Vendor` should call `yourToken.transferFrom(msg.sender, address(this), theAmount)` and if the user has approved the `Vendor` correctly, tokens should be sent to the `Vendor`, and ETH should be sent to the user.

- 📝 Edit `Vendor.sol` and add a `sellTokens(uint256 amount)` function!

- 🔨 Use the `Debug Contracts` tab to call `approve` and `sellTokens`

#### 🥅 Goal

- [ ] Can you sell tokens back to the vendor?
- [ ] Do you receive the right amount of ETH for the tokens?

### Checkpoint 6: ⚠️ Test it!!

- Now is a good time to run `yarn hardhat:test` to run the automated testing function. It will test that you hit the core checkpoints. You are looking for all green checkmarks and passing tests!
- As always, we should aim for our tests to cover 100% of our smart contract code. Run `yarn hardhat:test:coverage` to see if this is the case!

### Extension: 🌈 The Real Frontend 🌈

> So far, we've used the `Debug Contracts` tab to interact with our contracts, but this isn't very user friendly. Check out the `Example UI` tab (file `packages/nextjs/pages/example-ui.tsx`) to see what the start of a real UI could look like!

> `scaffold-eth-2` also provides us with some handy helpers in `nextjs/hooks`

#### Contract Interactions (Left)

The UI looks pretty good, but could be better, let's finish it off!

Currently when buying tokens, the user must enter the amount of ETH they are using to purchase, and they receive 100x this amount of `YourToken`s in return.

- Change this so that the user can enter the number of `YourToken`s they would like to buy
- Update the subtitle below the input to reflect how much ETH this will cost them
  - For example, if `100` is entered in the input then it should say `You pay: 1.0 ETH + Gas`

#### Events

- It would be a good idea to display `BuyTokens` Events. Display the event history on the right side of `Example UI` (see `ContractData.tsx`). Unleash your inner designer and showcase those events in a way users would like to see!
- Get new `BuyTokens` events to be added here in realtime as you interact with the contract
- Now, add a `SellTokens` event to `Vendor.sol` and do the same for those events!
