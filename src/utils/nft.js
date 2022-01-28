import axios from 'axios'
import { ethers } from 'ethers'

export async function getNFTById (nftContract, marketplaceContract, account, nftId) {
  const tokenUri = await nftContract.tokenURI(nftId)

  const { data: metadata } = await axios.get(tokenUri)

  const [marketItem, hasFound] = await marketplaceContract.getLatestMarketItemByTokenId(nftId)
  if (hasFound) {
    const price = ethers.utils.formatUnits(marketItem.price.toString(), 'ether')
    return {
      price,
      tokenId: nftId,
      marketItemId: marketItem.marketItemId,
      creator: marketItem.creator,
      seller: marketItem.seller,
      owner: marketItem.owner,
      sold: marketItem.sold,
      canceled: marketItem.canceled,
      image: metadata.image,
      name: metadata.name,
      description: metadata.description
    }
  }

  return {
    price: undefined,
    tokenId: nftId,
    marketItemId: undefined,
    creator: account,
    seller: null,
    owner: account,
    sold: false,
    canceled: false,
    image: metadata.image,
    name: metadata.name,
    description: metadata.description
  }
}
