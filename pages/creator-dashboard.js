import { LinearProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import NFTCardList from '../src/components/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { getNFTById } from '../src/utils/nft'

export default function CreatorDashboard () {
  const [nfts, setNfts] = useState([])
  const { account, marketplaceContract, nftContract, isReady } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadNFTs()
  }, [account, isReady])

  async function loadNFTs () {
    if (!isReady) return <></>
    const nftIdsCreatedByMe = await nftContract.getTokensCreatedByMe()
    const nftIdsOwnedByMe = await nftContract.getTokensOwnedByMe()
    const myNftIds = [...nftIdsCreatedByMe, ...nftIdsOwnedByMe]
    const myUniqueNftIds = [...new Map(myNftIds.map((item) => [item._hex, item])).values()]

    const myNfts = await Promise.all(myUniqueNftIds.map(async (nftId) =>
      await getNFTById(nftContract, marketplaceContract, account, nftId)
    ))
    setNfts(myNfts)
    setIsLoading(false)
  }

  if (isLoading) return <LinearProgress/>

  return (
    <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={true}/>
  )
}
