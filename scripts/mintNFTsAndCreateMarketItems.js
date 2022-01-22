const hre = require('hardhat')
const { nftmarketaddress, nftaddress } = require('../config')

const dogsMetadataUrl = 'https://ipfs.io/ipfs/Qma1wY9HLfdWbRr1tDPpVCfbtPPvjnai1rEukuqSxk6PWb?filename=undefined'
const techEventMetadataUrl = 'https://ipfs.io/ipfs/QmchRqWmRiHP2uXBGxT7sJJUJChDddHpyApoH94S3VkH42?filename=undefined'
const yellowCrownMetadataUrl = 'https://ipfs.io/ipfs/QmVXBCJcDtgtZfx77W86iG5hrJnFjWz1HV7naHAJMArqNT?filename=undefined'
const ashleyMetadataUrl = 'https://ipfs.io/ipfs/QmfY6ievFhyhcXBKMVNXGcEpubUejxaFex83TPmynDofgz?filename=ashley.png'

async function mintNFTsAndCreateMarketItems (marketplaceAddress = nftmarketaddress, nftAddress = nftaddress) {
  const marketplaceContract = await hre.ethers.getContractAt('Marketplace', marketplaceAddress)
  const nftContract = await hre.ethers.getContractAt('NFT', nftAddress)
  const [acc1, acc2] = await hre.ethers.getSigners()

  const price = hre.ethers.utils.parseEther('10')
  const listingFee = await marketplaceContract.getListingFee()

  await nftContract.mintToken(dogsMetadataUrl)
  await nftContract.mintToken(techEventMetadataUrl)
  await marketplaceContract.createMarketItem(nftContract.address, 1, price, { value: listingFee })
  await marketplaceContract.createMarketItem(nftContract.address, 2, price, { value: listingFee })
  console.log(`${acc1.address} minted 2 tokens and listed them as market items`)

  await nftContract.connect(acc2).mintToken(yellowCrownMetadataUrl)
  await nftContract.connect(acc2).mintToken(ashleyMetadataUrl)
  await marketplaceContract.connect(acc2).createMarketItem(nftContract.address, 3, price, { value: listingFee })
  await marketplaceContract.connect(acc2).createMarketItem(nftContract.address, 4, price, { value: listingFee })
  console.log(`${acc2.address} minted 2 tokens and listed them as market items`)
}

async function main () {
  if (process.env.IS_RUNNING) return
  await mintNFTsAndCreateMarketItems()
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

module.exports = {
  mintNFTsAndCreateMarketItems: mintNFTsAndCreateMarketItems
}
