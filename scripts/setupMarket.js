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

async function setupMarket (marketplaceAddress, nftAddress, erc20Address) {
  const networkName = hre.network.name.toUpperCase()
  marketplaceAddress = marketplaceAddress || process.env[`MARKETPLACE_CONTRACT_ADDRESS_${networkName}`]
  nftAddress = nftAddress || process.env[`NFT_CONTRACT_ADDRESS_${networkName}`]
  erc20Address = erc20Address || process.env[`ERC20_CONTRACT_ADDRESS_${networkName}`]

  const marketplaceContract = await hre.ethers.getContractAt('Marketplace', marketplaceAddress)
  const nftContract = await hre.ethers.getContractAt('NFT', nftAddress)
  const erc20Contract = await hre.ethers.getContractAt('MarkToken', erc20Address)
  const nftContractAddress = nftContract.address
  const erc20ContractAddress = erc20Contract.address
  const [acc1, acc2] = await hre.ethers.getSigners()

  await erc20Contract.transfer(acc2.address, hre.ethers.utils.parseEther('500000'))
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

  await erc20Contract.approve(marketplaceContract.address, listingFee)
  await marketplaceContract.createMarketItem(nftContractAddress, erc20ContractAddress, listingFee, dogsTokenId, price)

  await erc20Contract.approve(marketplaceContract.address, listingFee)
  await marketplaceContract.createMarketItem(nftContractAddress, erc20ContractAddress, listingFee, techEventTokenId, price)

  await erc20Contract.approve(marketplaceContract.address, listingFee)
  const codeconMarketTx = await marketplaceContract.createMarketItem(nftContractAddress, erc20ContractAddress, listingFee, codeconTokenId, price)
  const codeconMarketItemId = await getCreatedMarketItemId(codeconMarketTx)

  await erc20Contract.approve(marketplaceContract.address, listingFee)
  await marketplaceContract.createMarketItem(nftContractAddress, erc20ContractAddress, listingFee, webArTokenId, price)

  console.log(`${acc1.address} minted tokens ${dogsTokenId}, ${techEventTokenId}, ${codeconTokenId} and ${webArTokenId} and listed them as market items`)

  await marketplaceContract.cancelMarketItem(nftContractAddress, codeconMarketItemId)
  console.log(`${acc1.address} canceled market item for token ${codeconTokenId}`)

  const yellowMintTx = await nftContract.connect(acc2).mintToken(yellowCrownMetadataUrl)
  const yellowTokenId = await getMintedTokenId(yellowMintTx)
  const ashleyMintTx = await nftContract.connect(acc2).mintToken(ashleyMetadataUrl)
  const ashleyTokenId = await getMintedTokenId(ashleyMintTx)
  await erc20Contract.connect(acc2).approve(marketplaceContract.address, listingFee)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, erc20ContractAddress, listingFee, yellowTokenId, price)
  await erc20Contract.connect(acc2).approve(marketplaceContract.address, listingFee)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, erc20ContractAddress, listingFee, ashleyTokenId, price)
  console.log(`${acc2.address} minted tokens ${yellowTokenId} and ${ashleyTokenId} and listed them as market items`)

  await erc20Contract.approve(marketplaceContract.address, price)
  await marketplaceContract.createMarketSale(nftContractAddress, erc20ContractAddress, yellowTokenId)
  console.log(`${acc1.address} bought token ${yellowTokenId}`)
  await nftContract.approve(marketplaceContract.address, yellowTokenId)
  await erc20Contract.approve(marketplaceContract.address, listingFee)
  await marketplaceContract.createMarketItem(nftContractAddress, erc20ContractAddress, listingFee, yellowTokenId, price)
  console.log(`${acc1.address} put token ${yellowTokenId} for sale`)

  await erc20Contract.connect(acc2).approve(marketplaceContract.address, price)
  await marketplaceContract.connect(acc2).createMarketSale(nftContractAddress, erc20ContractAddress, dogsTokenId)
  await nftContract.connect(acc2).approve(marketplaceContract.address, dogsTokenId)
  await erc20Contract.connect(acc2).approve(marketplaceContract.address, listingFee)
  await marketplaceContract.connect(acc2).createMarketItem(nftContractAddress, erc20ContractAddress, listingFee, dogsTokenId, price)
  console.log(`${acc2.address} bought token ${dogsTokenId} and put it for sale`)

  await erc20Contract.connect(acc2).approve(marketplaceContract.address, price)
  await marketplaceContract.connect(acc2).createMarketSale(nftContractAddress, erc20ContractAddress, webArTokenId)
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
