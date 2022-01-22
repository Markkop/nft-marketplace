const { expect } = require('chai')
const { ethers } = require('hardhat')
const { BigNumber } = require('ethers')

describe('NFT', function () {
  let nftContract
  let account1
  let account2
  const marketplaceAddress = '0x8ba1f109551bD432803012645Ac136ddd64DBA72' // Random Mock Address

  beforeEach(async () => {
    const NFT = await ethers.getContractFactory('NFT')
    nftContract = await NFT.deploy(marketplaceAddress)
    await nftContract.deployed();
    [account1, account2] = await ethers.getSigners()
  })

  it("increases token's id after each mint", async function () {
    await expect(nftContract.mintToken(''))
      .to.emit(nftContract, 'TokenMinted')
      .withArgs(1, '', marketplaceAddress)

    await expect(nftContract.mintToken(''))
      .to.emit(nftContract, 'TokenMinted')
      .withArgs(2, '', marketplaceAddress)
  })

  it('gets token ids owned by msg.sender', async function () {
    await nftContract.mintToken('')
    await nftContract.connect(account2).mintToken('')
    await nftContract.mintToken('')
    await nftContract.transferFrom(account1.address, account2.address, 1)

    const nftIds = await nftContract.getTokensOwnedByMe()

    expect(nftIds).to.have.length(1)

    expect(nftIds).to.eql([
      BigNumber.from(3)
    ])
  })

  it('gets token ids created by msg.sender', async function () {
    await nftContract.mintToken('')
    await nftContract.connect(account2).mintToken('')
    await nftContract.mintToken('')

    const nftIds = await nftContract.getTokensCreatedByMe()

    expect(nftIds).to.have.length(2)

    expect(nftIds).to.eql([
      BigNumber.from(1),
      BigNumber.from(3)
    ])
  })

  it('gets token creator by id', async function () {
    await nftContract.mintToken('')
    const creator = await nftContract.getTokenCreatorById(1)
    expect(creator).to.eql(account1.address)
  })
})
