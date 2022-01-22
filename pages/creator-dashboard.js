import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import NFTCardList from '../src/components/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'

export default function CreatorDashboard () {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const { account, marketplaceContract, nftContract, isReady } = useContext(Web3Context)

  useEffect(() => {
    loadNFTs()
  }, [account, isReady])
  async function loadNFTs () {
    if (!isReady) return <></>
    const nftIdsCreatedByMe = await nftContract.getTokensCreatedByMe()
    const nftIdsOwnedByMe = await nftContract.getTokensOwnedByMe()
    const myNftIds = [...nftIdsCreatedByMe, ...nftIdsOwnedByMe]
    const myUniqueNftIds = [...new Map(myNftIds.map((item) => [item._hex, item])).values()]

    const myNfts = await Promise.all(myUniqueNftIds.map(async nftId => {
      const tokenUri = await nftContract.tokenURI(nftId)

      const { data: metadata } = await axios.get(tokenUri)

      const [marketItem, hasFound] = await marketplaceContract.getLatestMarketItemByTokenId(nftId)
      if (hasFound) {
        const price = ethers.utils.formatUnits(marketItem.price.toString(), 'ether')
        return {
          price,
          tokenId: nftId.toNumber(),
          marketItemId: marketItem.marketItemId,
          creator: marketItem.creator,
          seller: marketItem.seller,
          owner: marketItem.owner,
          sold: marketItem.sold,
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
        image: metadata.image,
        name: metadata.name,
        description: metadata.description
      }
    }))
    console.log(myNfts)
    setNfts(myNfts)
    setLoadingState('loaded')
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs created</h1>)
  return (
    <NFTCardList nfts={nfts} />
  )
}
