# 🖼️ NFT Marketplace

[![https://img.shields.io/badge/made%20with-hardhat-yellow](https://img.shields.io/badge/made%20with-hardhat-yellow)](https://hardhat.org/)
[![https://img.shields.io/badge/made%20with-nextjs-blue](https://img.shields.io/badge/made%20with-nextjs-blue)](https://nextjs.org/)

This is a fullstack dApp for an NFT Marketplace.  
The initial project was based on this [Udemy](ttps://www.udemy.com/course/build-an-nft-marketplace-from-scratch-blockchain-dapp/)'s / [Youtube](https://www.youtube.com/watch?v=GKJBEEXUha0)'s tutorial.  
However, to practice even further my blockchain and smart contract skills I've refactored most of the existing code and added several new features.

## Demo

https://nft-marketplace-ashen.vercel.app/ (Work still in progress)

## Features

- Mint, Buy, Sell and Cancel NFTs
- View all NFTs on sale
- View own created and on sale NFTs in a single page
- Update Vercel's frontend contract addresses on testnet deployment

# Setup

To avoid import errors in Solidity files when using VSCode Solidity extensions, add

```js
"solidity.packageDefaultDependenciesContractsDirectory": "",
"solidity.packageDefaultDependenciesDirectory": "node_modules"
```

to user's VSCode settings.

- Copy `.env.local.example` to `.env.local`

## How to run

- [In progress]

## How to deploy

In progress

## Troubleshooting

### Nouce is too hight

See https://medium.com/@thelasthash/solved-nonce-too-high-error-with-metamask-and-hardhat-adc66f092cd
