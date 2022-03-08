const { expect } = require('chai')
const { ethers } = require('hardhat')
const { BigNumber } = require('ethers')

describe('Marketplace', function () {
  let nftContract
  let erc20Contract
  let marketplaceContract
  let nftContractAddress
  let owner
  let buyer

  async function deployContractsAndSetAddresses () {
    const Marketplace = await ethers.getContractFactory('Marketplace')
    marketplaceContract = await Marketplace.deploy()
    await marketplaceContract.deployed()

    const NFT = await ethers.getContractFactory('NFT')
    nftContract = await NFT.deploy(marketplaceContract.address)
    await nftContract.deployed()

    const ERC20 = await ethers.getContractFactory('MarkToken')
    erc20Contract = await ERC20.deploy()
    await erc20Contract.deployed();

    [owner, buyer] = await ethers.getSigners()
    nftContractAddress = nftContract.address
  }

  beforeEach(deployContractsAndSetAddresses)

  async function mintTokenAndCreateMarketItem (listingFee, tokenId, price, transactionOptions = {}, account = owner) {
    await nftContract.connect(account).mintToken('')
    await erc20Contract.connect(account).approve(marketplaceContract.address, listingFee)
    return marketplaceContract.connect(account).createMarketItem(nftContractAddress, erc20Contract.address, listingFee, tokenId, price, transactionOptions)
  }

  it.only('creates a Market Item', async function () {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('10')
    const listingFee = await marketplaceContract.getListingFee()

    // Act and Assert
    await expect(mintTokenAndCreateMarketItem(listingFee, tokenId, price))
      .to.emit(marketplaceContract, 'MarketItemCreated')
      .withArgs(
        1,
        nftContractAddress,
        tokenId,
        owner.address,
        owner.address,
        ethers.constants.AddressZero,
        price,
        false,
        false
      )
  })

  it('creates successive market items for the same token id by buying and selling', async function () {
    // Arrange
    const token1id = 1
    const price = ethers.utils.parseEther('10')
    const listingFee = await marketplaceContract.getListingFee()

    // Account1 mints two tokens and put them for sale
    await nftContract.mintToken('')
    await marketplaceContract.createMarketItem(nftContractAddress, token1id, price, { value: listingFee })

    // Account 2 buys token 1
    const token1marketItemId = 1
    await marketplaceContract.connect(buyer).createMarketSale(nftContractAddress, token1marketItemId, { value: price })

    // Account 2 puts token 1 for sale
    await nftContract.connect(buyer).approve(marketplaceContract.address, token1id)
    await marketplaceContract.connect(buyer).createMarketItem(nftContractAddress, token1id, price, { value: listingFee })

    // Act
    // Account 1 buys token 1 back
    await marketplaceContract.createMarketSale(nftContractAddress, token1marketItemId, { value: price })

    // Assert
    const tokenOwner = await nftContract.ownerOf(token1id)
    expect(tokenOwner).to.eql(owner.address)
  })

  it('cancels a market item', async () => {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('1')
    const listingFee = await marketplaceContract.getListingFee()
    const transactionOptions = { value: listingFee }

    await mintTokenAndCreateMarketItem(tokenId, price, transactionOptions)

    // Act
    await marketplaceContract.cancelMarketItem(nftContractAddress, 1)

    // Assert
    const tokenOwner = await nftContract.ownerOf(1)
    expect(tokenOwner).to.eql(owner.address)
  })

  it('reverts when trying to cancel an inexistent market item', async () => {
    // Act and Assert
    expect(marketplaceContract.cancelMarketItem(nftContractAddress, 1))
      .to.be.revertedWith('Market item has to exist')
  })

  it('reverts when trying to cancel a market item whose seller is not msg.sender', async () => {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('1')
    const listingFee = await marketplaceContract.getListingFee()
    const transactionOptions = { value: listingFee }

    await mintTokenAndCreateMarketItem(tokenId, price, transactionOptions)

    // Act and Assert
    expect(marketplaceContract.connect(buyer).cancelMarketItem(nftContractAddress, 1))
      .to.be.revertedWith('You are not the seller')
  })

  it('gets latest Market Item by the token id', async function () {
    // Arrange
    const token1id = 1
    const token2id = 2
    const price = ethers.utils.parseEther('10')
    const listingFee = await marketplaceContract.getListingFee()

    // Account1 mints two tokens and put them for sale
    await nftContract.mintToken('')
    await nftContract.mintToken('')
    await marketplaceContract.createMarketItem(nftContractAddress, token1id, price, { value: listingFee })
    await marketplaceContract.createMarketItem(nftContractAddress, token2id, price, { value: listingFee })

    // Account 2 buys token 1
    const token1marketItemId = 1
    await marketplaceContract.connect(buyer).createMarketSale(nftContractAddress, token1marketItemId, { value: price })

    // Account 2 puts token 1 for sale
    await nftContract.connect(buyer).approve(marketplaceContract.address, token1id)
    await marketplaceContract.connect(buyer).createMarketItem(nftContractAddress, token1id, price, { value: listingFee })

    // Act
    const marketItemResult = await marketplaceContract.getLatestMarketItemByTokenId(token1id)

    // Assert
    const marketItem = [
      BigNumber.from(3),
      nftContractAddress,
      BigNumber.from(token1id),
      owner.address,
      buyer.address,
      ethers.constants.AddressZero,
      price,
      false,
      false
    ]
    expect(marketItemResult).to.eql([marketItem, true])
  })

  it('does not get a Market Item by a nonexistent token id', async function () {
    // Arrange
    const tokenId = 1

    // Act
    const marketItemResult = await marketplaceContract.getLatestMarketItemByTokenId(tokenId)

    // Assert
    const emptyMarketItem = [
      BigNumber.from(0),
      ethers.constants.AddressZero,
      BigNumber.from(0),
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      BigNumber.from(0),
      false,
      false
    ]
    expect(marketItemResult).to.eql([emptyMarketItem, false])
  })

  it('reverts a Market Item creation if listing fee is not right', async function () {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('10')
    const listingFee = await marketplaceContract.getListingFee()
    const wrongListingFee = listingFee.div(2)
    const transactionOptions = { value: wrongListingFee }

    // Act and Assert
    expect(mintTokenAndCreateMarketItem(tokenId, price, transactionOptions))
      .to.be.revertedWith('Price must be equal to listing price')
  })

  it('reverts a Market Item creation if price is 0', async function () {
    // Arrange
    const tokenId = 1
    const price = ethers.utils.parseEther('0')
    const listingFee = await marketplaceContract.getListingFee()
    const transactionOptions = { value: listingFee }

    // Act and Assert
    expect(mintTokenAndCreateMarketItem(tokenId, price, transactionOptions))
      .to.be.revertedWith('Price must be at least 1 wei')
  })

  it.only('creates a Market Sale', async function () {
    // Arrange
    await erc20Contract.transfer(buyer.address, ethers.utils.parseEther('500000'))

    const tokenId = 1
    const price = ethers.utils.parseEther('33')
    const listingFee = await marketplaceContract.getListingFee()
    await mintTokenAndCreateMarketItem(listingFee, tokenId, price)
    const initialOwnerBalance = await erc20Contract.balanceOf(owner.address)

    // Act
    await erc20Contract.connect(buyer).approve(marketplaceContract.address, price)
    await marketplaceContract.connect(buyer).createMarketSale(nftContractAddress, erc20Contract.address, 1)

    // Assert
    const expectedOwnerBalance = initialOwnerBalance.add(price).add(listingFee)

    expect(await erc20Contract.balanceOf(owner.address)).to.equal(expectedOwnerBalance)
    expect(await nftContract.ownerOf(tokenId)).to.equal(buyer.address)
  })

  it('reverts a Market Sale if offer price is not the same as listing price', async function () {
    // Arrange
    const tokenId = 1
    const listingPrice = ethers.utils.parseEther('10')
    const offerPrice = ethers.utils.parseEther('5')
    const listingFee = await marketplaceContract.getListingFee()
    const transactionOptions = { value: listingFee }

    await mintTokenAndCreateMarketItem(tokenId, listingPrice, transactionOptions)

    // Act and Assert
    expect(marketplaceContract.connect(buyer).createMarketSale(nftContractAddress, 1, { value: offerPrice }))
      .to.be.revertedWith('Please submit the asking price in order to continue')
  })

  it('fetches available NFT tokens', async function () {
    // Arrange
    const price = ethers.utils.parseEther('10')
    const listingFee = await marketplaceContract.getListingFee()
    const transactionOptions = { value: listingFee }
    await mintTokenAndCreateMarketItem(1, price, transactionOptions)
    await mintTokenAndCreateMarketItem(2, price, transactionOptions)

    // Act
    const unsoldMarketItems = await marketplaceContract.fetchAvailableMarketItems()

    // Assert
    expect(unsoldMarketItems.length).to.equal(2)
  })

  it('fetches NFT tokens owned by msg.sender ', async function () {
    // Arrange
    const price = ethers.utils.parseEther('10')
    const listingFee = await marketplaceContract.getListingFee()
    const transactionOptions = { value: listingFee }
    await mintTokenAndCreateMarketItem(1, price, transactionOptions)
    await mintTokenAndCreateMarketItem(2, price, transactionOptions)
    await marketplaceContract.connect(buyer).createMarketSale(nftContractAddress, 1, { value: price })

    // Act
    const buyerNFTTokens = await marketplaceContract.connect(buyer).fetchOwnedMarketItems()

    // Assert
    expect(buyerNFTTokens.length).to.equal(1)
    expect(buyerNFTTokens[0].tokenId).to.equal(1)
  })

  it('fetches NFT tokens that are listed by msg.sender', async function () {
    // Arrange
    const price = ethers.utils.parseEther('10')
    const listingFee = await marketplaceContract.getListingFee()
    const transactionOptions = { value: listingFee }
    await mintTokenAndCreateMarketItem(1, price, transactionOptions)
    await mintTokenAndCreateMarketItem(2, price, transactionOptions)
    await mintTokenAndCreateMarketItem(3, price, transactionOptions, buyer)

    // Act
    const buyerNFTTokens = await marketplaceContract.fetchSellingMarketItems()

    // Assert
    expect(buyerNFTTokens.length).to.equal(2)
  })
})
