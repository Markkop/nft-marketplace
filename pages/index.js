import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'

import NFTCardList from '../src/components/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'

export default function Home () {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const { account, marketplaceContract, nftContract, isReady } = useContext(Web3Context)

  useEffect(() => {
    loadNFTs()
  }, [account, isReady])
  async function loadNFTs () {
    if (!isReady) return <></>
    const data = await marketplaceContract.fetchUnsoldMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await nftContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      const item = {
        price,
        marketItemId: i.marketItemId.toNumber(),
        creator: i.creator,
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1>No items in marketplace</h1>)
  return (
    <NFTCardList nfts={nfts} withCreateNFT={false}/>
  )
}
