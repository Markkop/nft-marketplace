const hre = require('hardhat')

const dogsMetadataUrl = 'https://ipfs.io/ipfs/Qma1wY9HLfdWbRr1tDPpVCfbtPPvjnai1rEukuqSxk6PWb?filename=undefined'
const techEventMetadataUrl = 'https://ipfs.io/ipfs/QmchRqWmRiHP2uXBGxT7sJJUJChDddHpyApoH94S3VkH42?filename=undefined'
const yellowCrownMetadataUrl = 'https://ipfs.io/ipfs/QmVXBCJcDtgtZfx77W86iG5hrJnFjWz1HV7naHAJMArqNT?filename=undefined'
const ashleyMetadataUrl = 'https://ipfs.io/ipfs/QmdiA6eywkjMAVGTYRXerSQozLEBA3QpKmAt1E1mKVovhz?filename=undefined'
const codeconMetadataUrl = 'https://ipfs.io/ipfs/QmdMbGwGLmC5iNmv1hzRvJQpzrKmKfHjbB34k4e8AfqKay?filename=Codecon%20Tech%20Event'
const webArMetadataUrl = 'https://ipfs.io/ipfs/QmSzFfx3rNqdJwSsrFpfMcxZCncaATsCceaFEr6Lmq3VUz?filename=Showing%20off%20WebAR'

async function getMintedTokenId (transaction) {
  const transactionResult = await transaction.wait()
  const event = transactionResult.events[0]
  const value = event.args[2]
  return value.toNumber()
}

async function getCreatedMarketItemId (transaction) {
  const transactionResult = await transaction.wait()
  const marketItemEvent = transactionResult.events.find(event => event.args)
  const value = marketItemEvent.args[0]
  return value.toNumber()
}

async function setupMarket (marketplaceAddress, nftAddress) {
  const networkName = hre.network.name.toUpperCase()
  marketplaceAddress = marketplaceAddress || process.env[`MARKETPLACE_CONTRACT_ADDRESS_${networkName}`]
  nftAddress = nftAddress || process.env[`NFT_CONTRACT_ADDRESS_${networkName}`]

  const marketplaceContract = await hre.ethers.getContractAt('Marketplace', marketplaceAddress)
  const nftContract = await hre.ethers.getContractAt('NFT', nftAddress)
  const nftContractAddress = nftContract.address
  const [acc1, acc2] = await hre.ethers.getSigners()

  const price = hre.ethers.utils.parseEther('0.01')
  const listingFee = await marketplaceContract.getListingFee()

  const dogsMintTx = await nftContract.mintToken(dogsMetadataUrl)
  const dogsTokenId = await getMintedTokenId(dogsMintTx)
  const techEventMintTx = await nftContract.mintToken(techEventMetadataUrl)
  const techEventTokenId = await getMintedTokenId(techEventMintTx)
  const codeconMintTx = await nftContract.mintToken(codeconMetadataUrl)
  const codeconTokenId = await getMintedTokenId(codeconMintTx)
  const webArMintTx = await nftContract.mintToken(webArMetadataUrl)
  const webArTokenId = await getMintedTokenId(webArMintTx)
  await marketplaceContract.createMarketItem(nftContractAddress, dogsTokenId, price, { value: listingFee })
  await marketplaceContract.createMarketItem(nftContractAddress, techEventTokenId, price, { value: listingFee })
  const codeconMarketTx = await marketplaceContract.createMarketItem(nftContractAddress, codeconTokenId, price, { value: listingFee })
  const codeconMarketItemId = await getCreatedMarketItemId(codeconMarketTx)
  await marketplaceContract.createMarketItem(nftContractAddress, webArTokenId, price, { value: listingFee })
  console.log(`${acc1.address} minted tokens ${dogsTokenId}, ${techEventTokenId}, ${codeconTokenId} and ${webArTokenId} and listed them as market items`)

  await marketplaceContract.cancelMarketItem(nftContractAddress, codeconMarketItemId)
  console.log(`${acc1.address} canceled market item for token ${codeconTokenId}`)

  const yellowMintTx = await nftContract.connect(acc2).mintToken(yellowCrownMetadataUrl)
  const yellowTokenId = await getMintedTokenId(yellowMintTx)
  const ashleyMintTx = await nftContract.connect(acc2).mintToken(ashleyMetadataUrl)
  const ashleyTokenId = await getMintedTokenId(ashleyMintTx)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, yellowTokenId, price, { value: listingFee })
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, ashleyTokenId, price, { value: listingFee })
  console.log(`${acc2.address} minted tokens ${yellowTokenId} and ${ashleyTokenId} and listed them as market items`)

  await marketplaceContract.createMarketSale(nftContractAddress, yellowTokenId, { value: price })
  console.log(`${acc1.address} bought token ${yellowTokenId}`)
  await nftContract.approve(marketplaceContract.address, yellowTokenId)
  await marketplaceContract.createMarketItem(nftContractAddress, yellowTokenId, price, { value: listingFee })
  console.log(`${acc1.address} put token ${yellowTokenId} for sale`)

  await marketplaceContract.connect(acc2).createMarketSale(nftContractAddress, dogsTokenId, { value: price })
  await nftContract.connect(acc2).approve(marketplaceContract.address, dogsTokenId)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, dogsTokenId, price, { value: listingFee })
  console.log(`${acc2.address} bought token ${dogsTokenId} and put it for sale`)

  await marketplaceContract.connect(acc2).createMarketSale(nftContractAddress, webArTokenId, { value: price })
  console.log(`${acc2.address} bought token ${webArTokenId}`)
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
