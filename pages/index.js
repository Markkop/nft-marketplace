import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'

import NFTCardList from '../src/components/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'

export default function Home () {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { account, marketplaceContract, nftContract, isReady, network } = useContext(Web3Context)

  useEffect(() => {
    loadNFTs()
  }, [account, network, isReady])
  async function loadNFTs () {
    if (!isReady || !network) return <></>
    const data = await marketplaceContract.fetchUnsoldMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await nftContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      const item = {
        price,
        marketItemId: i.marketItemId,
        tokenId: i.tokenId,
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
    setIsLoading(false)
  }

  if (!network) return <UnsupportedChain/>
  if (isLoading) return <LinearProgress/>
  if (!isLoading && !nfts.length) return <h1>No NFTs for sale</h1>
  return (
    <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={false}/>
  )
}
