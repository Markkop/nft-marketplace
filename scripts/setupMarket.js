const hre = require('hardhat')
const { MARKETPLACE_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } = process.env

const dogsMetadataUrl = 'https://ipfs.io/ipfs/Qma1wY9HLfdWbRr1tDPpVCfbtPPvjnai1rEukuqSxk6PWb?filename=undefined'
const techEventMetadataUrl = 'https://ipfs.io/ipfs/QmchRqWmRiHP2uXBGxT7sJJUJChDddHpyApoH94S3VkH42?filename=undefined'
const yellowCrownMetadataUrl = 'https://ipfs.io/ipfs/QmVXBCJcDtgtZfx77W86iG5hrJnFjWz1HV7naHAJMArqNT?filename=undefined'
const ashleyMetadataUrl = 'https://ipfs.io/ipfs/QmdiA6eywkjMAVGTYRXerSQozLEBA3QpKmAt1E1mKVovhz?filename=undefined'

async function setupMarket (marketplaceAddress = MARKETPLACE_CONTRACT_ADDRESS, nftAddress = NFT_CONTRACT_ADDRESS) {
  const marketplaceContract = await hre.ethers.getContractAt('Marketplace', marketplaceAddress)
  const nftContract = await hre.ethers.getContractAt('NFT', nftAddress)
  const nftContractAddress = nftContract.address
  const [acc1, acc2] = await hre.ethers.getSigners()

  const price = hre.ethers.utils.parseEther('10')
  const listingFee = await marketplaceContract.getListingFee()

  await nftContract.mintToken(dogsMetadataUrl)
  await nftContract.mintToken(techEventMetadataUrl)
  await marketplaceContract.createMarketItem(nftContractAddress, 1, price, { value: listingFee })
  await marketplaceContract.createMarketItem(nftContractAddress, 2, price, { value: listingFee })
  console.log(`${acc1.address} minted tokens 1 and 2 and listed them as market items`)

  await nftContract.connect(acc2).mintToken(yellowCrownMetadataUrl)
  await nftContract.connect(acc2).mintToken(ashleyMetadataUrl)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, 3, price, { value: listingFee })
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, 4, price, { value: listingFee })
  console.log(`${acc2.address} minted tokens 3 and 4 and listed them as market items`)

  await marketplaceContract.createMarketSale(nftContractAddress, 3, { value: price })
  await nftContract.approve(marketplaceContract.address, 3)
  await marketplaceContract.createMarketItem(nftContractAddress, 3, price, { value: listingFee })
  console.log(`${acc1.address} bought token 3 and put it for sale`)

  await marketplaceContract.connect(acc2).createMarketSale(nftContractAddress, 1, { value: price })
  await nftContract.connect(acc2).approve(marketplaceContract.address, 1)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, 1, price, { value: listingFee })
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
