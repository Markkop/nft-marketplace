const { expect } = require("chai");
const { ethers, BigNumber } = require("hardhat");

describe("Marketplace", function () {
  let nftContract;
  let marketplaceContract;
  let nftContractAddress;
  let owner;
  let buyer;

  async function deployContractsAndSetAddresses() {
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplaceContract = await Marketplace.deploy();
    await marketplaceContract.deployed();

    const NFT = await ethers.getContractFactory("NFT");
    nftContract = await NFT.deploy(marketplaceContract.address);
    await nftContract.deployed();

    [owner, buyer] = await ethers.getSigners();
    nftContractAddress = nftContract.address;
  }

  beforeEach(deployContractsAndSetAddresses);

  async function mintTokenAndCreateMarketItem(tokenId, price, transactionOptions) {
    await nftContract.mintToken('');
    return marketplaceContract.createMarketItem(nftContractAddress, tokenId, price, transactionOptions)
  }

  it("creates a Market Item", async function () {
    // Arrange
    const tokenId = 1;
    const price = ethers.utils.parseEther("10");
    const listingFee = await marketplaceContract.getListingFee();
    const transactionOptions = { value: listingFee }

    // Act and Assert
    await expect(mintTokenAndCreateMarketItem(tokenId, price, transactionOptions))
      .to.emit(marketplaceContract, "MarketItemCreated")
      .withArgs(
        1,
        nftContractAddress,
        tokenId,
        owner.address,
        ethers.constants.AddressZero,
        price,
        false
      );
  });

  it("reverts a Market Item creation if listing fee is not right", async function () {
    // Arrange
    const tokenId = 1;
    const price = ethers.utils.parseEther("10");
    const listingFee = await marketplaceContract.getListingFee();
    const wrongListingFee = listingFee.div(2);
    const transactionOptions = { value: wrongListingFee }

    // Act and Assert
    expect(mintTokenAndCreateMarketItem(tokenId, price, transactionOptions))
      .to.be.revertedWith("Price must be equal to listing price");
  });

  it("reverts a Market Item creation if price is 0", async function () {
    // Arrange
    const tokenId = 1;
    const price = ethers.utils.parseEther("0");
    const listingFee = await marketplaceContract.getListingFee();
    const transactionOptions = { value: listingFee }

    // Act and Assert
    expect(mintTokenAndCreateMarketItem(tokenId, price, transactionOptions))
      .to.be.revertedWith("Price must be at least 1 wei");
  });

  it("creates a Market Sale", async function () {
    // Arrange
    const tokenId = 1;
    const price = ethers.utils.parseEther("1");
    const listingFee = await marketplaceContract.getListingFee();
    const transactionOptions = { value: listingFee }

    await mintTokenAndCreateMarketItem(tokenId, price, transactionOptions);
    const initialOwnerBalance = await owner.getBalance();

    // Act
    await marketplaceContract.connect(buyer).createMarketSale(nftContractAddress, 1, { value: price });

    // Assert
    const expectedOwnerBalance = initialOwnerBalance.add(price).add(listingFee)
    expect(await owner.getBalance()).to.equal(expectedOwnerBalance);
    expect(await nftContract.ownerOf(tokenId)).to.equal(buyer.address)
  });

  it("reverts a Market Sale if offer price is not the same as listing price", async function () {
    // Arrange
    const tokenId = 1;
    const listingPrice = ethers.utils.parseEther("10");
    const offerPrice = ethers.utils.parseEther("5");
    const listingFee = await marketplaceContract.getListingFee();
    const transactionOptions = { value: listingFee }

    await mintTokenAndCreateMarketItem(tokenId, listingPrice, transactionOptions);

    // Act and Assert
    expect(marketplaceContract.connect(buyer).createMarketSale(nftContractAddress, 1, { value: offerPrice }))
      .to.be.revertedWith("Please submit the asking price in order to continue");

  });
});
