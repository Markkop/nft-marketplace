import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  nftmarketaddress, nftaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

export default function CreatorDashboard () {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs () {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider)

    const nftIdsCreatedByMe = await nftContract.getTokensCreatedByMe()

    const myNfts = await Promise.all(nftIdsCreatedByMe.map(async nftId => {
      const tokenUri = await nftContract.tokenURI(nftId)

      const { data: metadata } = await axios.get(tokenUri)

      const marketItem = await marketContract.getMarketItemByTokenId(nftId)
      if (marketItem.price) {
        const price = ethers.utils.formatUnits(marketItem.price.toString(), 'ether')
        return {
          price,
          tokenId: nftId.toNumber(),
          seller: marketItem.seller,
          owner: marketItem.owner,
          sold: marketItem.sold,
          image: metadata.image
        }
      }

      return {
        price: null,
        tokenId: nftId,
        owner: signer.address,
        sold: false,
        image: metadata.image
      }
    }))
    setNfts(myNfts)
    setLoadingState('loaded')
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs created</h1>)
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={nft.tokenId} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
