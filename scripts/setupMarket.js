const hre = require('hardhat')
const { MARKETPLACE_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } = process.env

const dogsMetadataUrl = 'https://ipfs.io/ipfs/Qma1wY9HLfdWbRr1tDPpVCfbtPPvjnai1rEukuqSxk6PWb?filename=undefined'
const techEventMetadataUrl = 'https://ipfs.io/ipfs/QmchRqWmRiHP2uXBGxT7sJJUJChDddHpyApoH94S3VkH42?filename=undefined'
const yellowCrownMetadataUrl = 'https://ipfs.io/ipfs/QmVXBCJcDtgtZfx77W86iG5hrJnFjWz1HV7naHAJMArqNT?filename=undefined'
const ashleyMetadataUrl = 'https://ipfs.io/ipfs/QmdiA6eywkjMAVGTYRXerSQozLEBA3QpKmAt1E1mKVovhz?filename=undefined'

async function getMintedTokenId (transaction) {
  const transactionResult = await transaction.wait()
  const event = transactionResult.events[0]
  const value = event.args[2]
  return value.toNumber()
}

async function setupMarket (marketplaceAddress = MARKETPLACE_CONTRACT_ADDRESS, nftAddress = NFT_CONTRACT_ADDRESS) {
  const marketplaceContract = await hre.ethers.getContractAt('Marketplace', marketplaceAddress)
  const nftContract = await hre.ethers.getContractAt('NFT', nftAddress)
  const nftContractAddress = nftContract.address
  const [acc1, acc2] = await hre.ethers.getSigners()

  const price = hre.ethers.utils.parseEther('10')
  const listingFee = await marketplaceContract.getListingFee()

  const tx1 = await nftContract.mintToken(dogsMetadataUrl)
  const tokenId1 = await getMintedTokenId(tx1)
  const tx2 = await nftContract.mintToken(techEventMetadataUrl)
  const tokenId2 = await getMintedTokenId(tx2)
  await marketplaceContract.createMarketItem(nftContractAddress, tokenId1, price, { value: listingFee })
  await marketplaceContract.createMarketItem(nftContractAddress, tokenId2, price, { value: listingFee })
  console.log(`${acc1.address} minted tokens ${tokenId1} and ${tokenId2} and listed them as market items`)

  const tx3 = await nftContract.connect(acc2).mintToken(yellowCrownMetadataUrl)
  const tokenId3 = await getMintedTokenId(tx3)
  const tx4 = await nftContract.connect(acc2).mintToken(ashleyMetadataUrl)
  const tokenId4 = await getMintedTokenId(tx4)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, tokenId3, price, { value: listingFee })
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, tokenId4, price, { value: listingFee })
  console.log(`${acc2.address} minted tokens ${tokenId3} and ${tokenId4} and listed them as market items`)

  await marketplaceContract.createMarketSale(nftContractAddress, tokenId3, { value: price })
  await nftContract.approve(marketplaceContract.address, tokenId3)
  await marketplaceContract.createMarketItem(nftContractAddress, tokenId3, price, { value: listingFee })
  console.log(`${acc1.address} bought token 3 and put it for sale`)

  await marketplaceContract.connect(acc2).createMarketSale(nftContractAddress, tokenId1, { value: price })
  await nftContract.connect(acc2).approve(marketplaceContract.address, tokenId1)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, tokenId1, price, { value: listingFee })
  console.log(`${acc2.address} bought token 1 and put it for sale`)
}

async function main () {
  if (process.env.IS_RUNNING) return
  await setupMarket()
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

module.exports = {
  setupMarket: setupMarket
}
