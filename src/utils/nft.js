import axios from 'axios'
import { ethers } from 'ethers'

export async function getTokenMetadataByTokenId (nftContract, tokenId) {
  try {
    const tokenUri = await nftContract.tokenURI(tokenId)
    const { data: metadata } = await axios.get(tokenUri)
    return metadata
  } catch (error) {
    console.log(error)
  }
}

export function mapAvailableMarketItems (nftContract) {
  return async (marketItem) => {
    const metadata = await getTokenMetadataByTokenId(nftContract, marketItem.tokenId)
    return mapMarketItem(marketItem, metadata)
  }
}

export function mapCreatedAndOwnedTokenIdsAsMarketItems (marketplaceContract, nftContract, account) {
  return async (tokenId) => {
    const metadata = await getTokenMetadataByTokenId(nftContract, tokenId)
    const [foundMarketItem, hasFound] = await marketplaceContract.getLatestMarketItemByTokenId(tokenId)
    const marketItem = hasFound ? foundMarketItem : {}
    return mapMarketItem(marketItem, metadata, tokenId, account)
  }
}

export function mapMarketItem (marketItem, metadata, tokenId, account) {
  return {
    price: marketItem.price ? ethers.utils.formatUnits(marketItem.price, 'ether') : undefined,
    tokenId: marketItem.tokenId || tokenId,
    marketItemId: marketItem.marketItemId || undefined,
    creator: marketItem.creator || account,
    seller: marketItem.seller || undefined,
    owner: marketItem.owner || account,
    sold: marketItem.sold || false,
    canceled: marketItem.canceled || false,
    image: metadata.image,
    name: metadata.name,
    description: metadata.description
  }
}

export async function getUniqueOwnedAndCreatedTokenIds (nftContract) {
  const nftIdsCreatedByMe = await nftContract.getTokensCreatedByMe()
  const nftIdsOwnedByMe = await nftContract.getTokensOwnedByMe()
  const myNftIds = [...nftIdsCreatedByMe, ...nftIdsOwnedByMe]
  return [...new Map(myNftIds.map((item) => [item._hex, item])).values()]
}
