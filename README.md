## 🏵 Token Vendor 🤖

🤖 Smart contracts are kind of like "always on" _vending machines_ that **anyone** can access. Let's make a decentralized, digital currency. Then, let's build an unstoppable vending machine that will buy and sell the currency. We'll learn about the `approve` pattern for ERC20s and how contract to contract interactions work.

### You will

- 🏵 Create a `YourToken.sol` token contract that inherits the **ERC20** token standard from OpenZeppelin

- 🤖 Create a `Vendor.sol` contract that sells and buys your tokens

- 🌈 Extension: Edit the frontend that invites the user to `<input\>` an amount of tokens they want to buy or sell. We'll display a preview of the amount of ETH they will spend or receive, as well as a history of usages (`Event`s) of the vendor.

🧫 Everything starts by ✏ editing `YourToken.sol` in `packages/hardhat/contracts`

---

### Requirements

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)
  - `yarn` is an **alternative** to `npm`, please do not use any `npm` commands for this assignment!

---

### Checkpoint 0: Clone and Install

```
git clone git@github.com:Scalene-Academy/scalene-token-vendor-yourname.git
cd scalene-token-vendor-yourname
yarn install
```

### Checkpoint 1: 🔭 Environment 📺

You'll have three terminals up for:

```
yarn chain   (local hardhat network)
yarn start   (nextjs frontend)
yarn deploy  (to compile, deploy, and publish your contracts to the hardhat network)
```

> 👀 Visit your frontend at http://localhost:3000.
>
> 💻 During development, we'll be using the `Debug Contracts` tab

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to redeploy your contracts

> 😌 Ignore any errors or warnings for now, we'll get to that...

---

### Checkpoint 2: 🏵Your Token 💵

- 👩‍💻 Edit `YourToken.sol` to inherit the **ERC20** token standard from OpenZeppelin

- Mint **1000** (\* 10 \*\* 18) to your frontend address in the `constructor()`.

  - (Your frontend address is the address in the top right of http://localhost:3000)

> Remember, you can always `yarn deploy --reset` to redeploy your contracts until you get it right.

#### 🥅 Goals

- [ ] Can you check the `balanceOf()` your frontend address?
- [ ] Can you `transfer()` your token to another account and check _that_ account's `balanceOf`?

---

### Checkpoint 3: ⚖️ Vendor 🤖

- 👩‍💻 Edit the `Vendor.sol` contract with a `payable` `buyTokens()` function

  - Use a price variable named `tokensPerEth` set to **100**:

    ```solidity
    uint256 public constant tokensPerEth = 100;
    ```

  - 📝 The `buyTokens()` function in `Vendor.sol` should use `msg.value` and `tokensPerEth` to calculate an amount of tokens to `yourToken.transfer()` to `msg.sender`.

  - 📟 Define and `emit` an **event** `BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens)` when tokens are purchased.

- Uncomment the lines in `deploy/01_deploy_vendor.ts` to deploy the `Vendor` and redeploy your contracts

- When you try to buy tokens from the vendor, you should get an error: `ERC20: transfer amount exceeds balance`

  - ⚠️ This is because the Vendor contract doesn't have any `YourToken`s yet!

  - ⚔️ Side Quest: send tokens from your frontend address to the Vendor contract address and _then_ try to buy them.

  - ✏️ We can't hard code the vendor address in the token's constructor, because we won't know the vendor address at the time we create the token contract (because the token is deployed first!).

  - ✏️ So instead, edit `YourToken.sol` to mint the tokens to the `msg.sender` (deployer) in the `constructor()`.

  - ✏️ Then, edit `deploy/01_deploy_vendor.ts` to transfer 1000 tokens to `vendor.address`.

    ```js
    await yourToken.transfer(vendor.address, ethers.utils.parseEther("1000"));
    ```

> Remember, you can always `yarn deploy --reset` to redeploy your contracts until you get it right.

#### 🥅 Goals

- [ ] Does the `Vendor` address start with a `balanceOf` **1000** `YourToken`s?
- [ ] Can you buy **10** tokens for **0.1** ETH?
- [ ] Can you transfer tokens to a different account?

### Checkpoint 4: 🕴 Become the Owner

- 📝 Edit `Vendor.sol` to inherit `Ownable`.

- In `deploy/01_deploy_vendor.ts` you will need to call `transferOwnership()` on the `Vendor` to make _your frontend address_ the `owner`:

  ```js
  await vendor.transferOwnership("**YOUR FRONTEND ADDRESS**");
  ```

- 📝 Finally, add a `withdraw()` function in `Vendor.sol` that only allows the owner to withdraw ETH from the vendor.

#### 🥅 Goals

- [ ] Is your frontend address the `owner` of the `Vendor`?
- [ ] Can **only** the `owner` withdraw the ETH from the `Vendor`?

---

### Checkpoint 5: 🤔 Vendor Buyback 🤯

👩‍🏫 The hardest part of this assignment is to modify your `Vendor` to buy the tokens back.

🧐 The reason why this is hard is the `approve()` pattern in ERC20s.

😕 First, the user has to call `approve()` on the `YourToken` contract, allowing the `Vendor` contract address to take some amount of tokens.

🤨 Then, the user makes a _second transaction_ to the `Vendor` contract to `sellTokens(uint256 amount)`.

🤓 The `Vendor` should call `yourToken.transferFrom(msg.sender, address(this), theAmount)` and if the user has approved the `Vendor` correctly, tokens should be sent to the `Vendor`, and ETH should be sent to the user.

- 📝 Edit `Vendor.sol` and add a `sellTokens(uint256 amount)` function!
- 🔨 Use the `Debug Contracts` tab to call `approve` and `sellTokens`

#### 🥅 Goal

- [ ] Can you sell tokens back to the vendor using the `approve` pattern?
- [ ] Do you receive the right amount of ETH for the tokens?

### Checkpoint 6: ⚠️ Test it!!

- Now is a good time to run `yarn hardhat:test` to run the automated testing function. It will test that you hit the core checkpoints. You are looking for all green checkmarks and passing tests!
- As always, we should aim for our tests to cover 100% of our smart contract code. Run `yarn hardhat:test:coverage` to see if this is the case!
  - If the coverage report says the `_mint` line in `YourToken`'s `constructor` isn't covered, don't worry! We trust that OpenZeppelin's implementations work

### Extension 1 (Optional): 🌈 The Real Frontend 🌈

So far, we've used the `Debug Contracts` tab to interact with our contracts, but this isn't very user friendly. Check out the `Example UI` tab (file `packages/nextjs/pages/example-ui.tsx`) to see what the start of a real UI could look like!

`scaffold-eth-2` also provides us with some handy helpers in `nextjs/hooks`

Note that the frontend uses [tailwindcss](https://tailwindcss.com/) for styling

#### Contract Interactions (Left)

- Uncomment the commented out code in `ContractInteraction/index.tsx`
- Have a play around with the contract interaction UI

The UI looks pretty good, but could be better, let's finish it off!

Currently when buying tokens, the user must enter the amount of ETH they are using to purchase, and they receive 100x this amount of `YourToken`s in return.

- Change this so that the user enters the number of `YourToken`s they would like to buy instead
- Update the subtitle below the input to reflect how much ETH this will cost them
  - For example, if `100` is entered in the input then it should say `You pay: 1.0 ETH + Gas`

#### Events

- It would be a good idea to display `BuyTokens` Events. Display the event history on the right side of `Example UI` (see `ContractData.tsx`). Unleash your inner designer and showcase those events in a way users would like to see!
- Get new `BuyTokens` events to be added here in realtime as you interact with the contract
- Now, add a `SellTokens` event to `Vendor.sol` and do the same for those events!

### Extension 2 (Optional): 🎂 Additional Changes 🎂

Add any features you think would improve your Token Vendor! Just remember to ensure the core functionality stays intact and the test suite still passes!
