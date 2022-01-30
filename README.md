# 🖼️ NFT Marketplace

[![https://img.shields.io/badge/made%20with-hardhat-yellow](https://img.shields.io/badge/made%20with-hardhat-yellow)](https://hardhat.org/)
[![https://img.shields.io/badge/made%20with-nextjs-blue](https://img.shields.io/badge/made%20with-nextjs-blue)](https://nextjs.org/)

This is a fullstack DApp NFT Marketplace built as a study project to learn more about blockchain and smart contract development.  
Made with NodeJS, Hardhat, Solidity, ReactJS, NextJS and Vercel.

## Demo

![Demo](https://github.com/Markkop/nft-marketplace/demo.gif)

https://nft-marketplace-markkop.vercel.app/

## Features

### Market basic actions

You can **create** (mint) new tokens, uploading their image and metadata do [IPFS](https://ipfs.io/) using [Pinata](https://www.pinata.cloud/).  
If you've created or bought an NFT, you may also **sell** it by setting a price and paying a listing fee.  
When **buying** an NFT, the price will be transfered to the seller and the listing fee to the NFT Marketplace owner.  
It's also possible to **cancel** a market item, transfering it back to the owner.

### Lean NFTs Visualization

There are only two pages to view market's NFTs:

- **Market Page**

Shows all NFTs that are available to be bought.  
This page will show NFTs even if the user doesn't have the [Metamask](https://metamask.io/) extension or isn't connected to the dapp.

![NFTs available](https://user-images.githubusercontent.com/16388408/151682517-6c0d89eb-80e6-4eeb-a6b0-6d584cdca5a3.png)
_NFTs available_

- **My NFTs Page**

Show all account's created, owned and on sale NFTs.  
Here you keep track of NFT's you've created and check for how much they've been last sold and their current owner.  
You can also list your current owned NFTs or cancel existing ones.  
To view this page you must have Metamask installed and have it connected to Polygon's Testnet network.

![Created and owned NFTs](https://user-images.githubusercontent.com/16388408/151682482-9db61934-bf17-4ea7-bd09-8c3ee5878f13.png)
_Created and owned NFTs_

### User Experience

If the Metamask extension is not detected on "My NFTs" page, a message with a **download button** will be prompted to the user.

![Download metamask message and buttons](https://user-images.githubusercontent.com/16388408/151679982-16116556-c354-44d0-93dc-468de64194fa.png)
_Download metamask message and buttons_

If the user has the extension, but is not connected, a message and a connect button will be shown.

![Connect wallet message and buttom](https://user-images.githubusercontent.com/16388408/151680390-1e7440f7-4774-4b15-acfe-a2906f914fd2.png)
_Connect wallet message and buttom_

If the Polygon's Testnet network is not detected, a message and a **ADD/CHANGE network button** will be available.

![Add/Change Network message and buttom](https://user-images.githubusercontent.com/16388408/151680408-68255aa6-fee3-49b9-b8f2-36b0b62b406d.png)
_Add/Change Network message and buttom_

If the connected account is low on balance of Matic tokens, a message with a faucet link is provided.

![A low on balance message with a faucet link](https://user-images.githubusercontent.com/16388408/151680555-a837c767-ae42-4826-8417-d46b78b68742.png)
_A low on balance message with a faucet link_

When **changing account or network**, the page will refresh updating only the affected components.

![Components update on account change](https://user-images.githubusercontent.com/16388408/151680788-ab141ef4-1168-4a32-bd28-2530743c3097.gif)
_Components update on account change_

When performing an action, a loading feedback is shown and the card updates to its new state automatically.

![Buying an NFT and its feedbacks](https://user-images.githubusercontent.com/16388408/151680863-c03ede64-ec7b-403d-9a35-e7b3ba76220e.gif)
_Buying an NFT and its feedbacks_

The page is also responsive to mobile.

### Deployment

Frontend is automatically deployed using Vercel's Github intefration, but contracts have to be manually deployed to keep a better control on them.  
However, new deployed contract addresses can be updated on the frontend simply by running a script that modifies Vercel's project enviroment variables and triggers a new frontend deployment.

# Setup

## How to run

- Copy `.env.local.example` to `.env.local` and fill it with environment variables
- Run `npm run node` to start a local EVM blockchain testnet
- Run `npm run setup` to deploy NFT and Marketplace contracts and perform some initial actions to the local blockchain
- Run `npm run dev` to start frontend application
- Make sure to use `Localhost 8545` as the Metamask's network
- Make sure to import local Account #0 and #1 into Metamask accounts.

## How to deploy

- Frontend is deployed automatically on `main` branch using Vercel's github integration
- Set ACCOUNT_PRIVATE_KEY in `.env.local` and send it some Polygon's Testnet [Matic](https://faucet.polygon.technology/) tokens
- Run `npm run deploy:mumbai` to deploy contracts to Polygon`s Testnet (Mumbai)
- Optional: do the same for ACCOUNT2_PRIVATE_KEY env and run `npm run setup-marketplace:mumbai` to setup the marketplace with existing tokens and sales.
- Run `npm run env` to update Vercel's environment variables with the new deployed contract addresses.\*
- Make sure to use `Polygon Testnet Mumbai` as Metamask's network
  _\* You'll need to create the envs on Vercel first_

## Development Challenges

- Updating NFT UI Cards after an action was performed
- Dealing with [Metamask's accountsChanged event being fired twice on mobile](https://github.com/MetaMask/metamask-mobile/issues/2162)
- Building a Web3 context provider
- Debugging different problems that ended up causing "Estimate gas failed" errors\*
  _\* They're usually caused by incorrect contract addresses and wrong default gas values_

## Troubleshooting

### Mumbai marketplace setup command is breaking with a 'estimate gas failed' error

Try changing `hardhat.config.js` mumbai gas values.
I'm using the ones I've found here:
https://forum.moralis.io/t/deploy-to-polygon-matic-mumbai-fails/700

### Nouce is too hight

Reset your Metamask account transaction history.
Find out more on:
https://medium.com/@thelasthash/solved-nonce-too-high-error-with-metamask-and-hardhat-adc66f092cd

## References

- [FreeCodeCamp’s Solidity, Blockchain, and Smart Contract Course](https://www.youtube.com/watch?v=M576WGiDBdQ)
- [Building a Full Stack NFT Marketplace on Ethereum with Polygon](https://dev.to/dabit3/building-scalable-full-stack-apps-on-ethereum-with-polygon-2cfb)
- [Chainlist.org source code](https://github.com/antonnell/networklist-org)
- [Import & Test a Popular NFT Smart Contract with Hardhat & Ethers](https://dev.to/jacobedawson/import-test-a-popular-nft-smart-contract-with-hardhat-ethers-12i5)
