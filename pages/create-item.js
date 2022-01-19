import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { useForm } from 'react-hook-form'

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

async function uploadDataToIPFS (data) {
  try {
    const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
    const added = await client.add(data)
    return `https://ipfs.infura.io/ipfs/${added.path}`
  } catch (error) {
    console.log('Error uploading file: ', error)
  }
}

export default function CreateItem () {
  const [fileUrl, setFileUrl] = useState(null)
  const { register, handleSubmit } = useForm()
  const router = useRouter()

  async function onFileChange (event) {
    const file = event.target.files[0]
    const url = await uploadDataToIPFS(file)
    setFileUrl(url)
  }

  async function createMarket (name, description, price, assetFileUrl) {
    if (!name || !description || !price || !assetFileUrl) return
    const data = JSON.stringify({ name, description, image: assetFileUrl })
    const metadataUrl = await uploadDataToIPFS(data)
    await createSale(metadataUrl, price)
  }

  async function createSale (metadataUrl, price) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.mintToken(metadataUrl)
    const tx = await transaction.wait()
    const event = tx.events[0]
    const value = event.args[2]
    const tokenId = value.toNumber()

    const priceInWei = ethers.utils.parseUnits(price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingFee = await contract.getListingFee()
    listingFee = listingFee.toString()

    transaction = await contract.createMarketItem(nftaddress, tokenId, priceInWei, { value: listingFee })
    await transaction.wait()
    router.push('/')
  }

  async function onSubmit (formData) {
    const { name, description, price } = formData
    await createMarket(name, description, price, fileUrl)
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            placeholder="Asset Name"
            className="mt-8 border rounded p-4"
            name="name"
            {...register('name')}
          />
          <textarea
            placeholder="Asset Description"
            className="mt-2 border rounded p-4"
            name="description"
            {...register('description')}
          />
          <input
            placeholder="Asset Price"
            className="mt-2 border rounded p-4"
            name="price"
            {...register('price')}
          />
          <input
            type="file"
            name="Asset"
            className="my-4"
            onChange={onFileChange}
          />
          {
            fileUrl && (
              <img className="rounded mt-4" width="350" src={fileUrl} />
            )
          }
          <button type="submit" className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
            Create Digital Asset
          </button>
        </form>

      </div>
    </div>
  )
}
