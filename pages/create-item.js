import { useState } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { useForm } from 'react-hook-form'

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

function createNFTFormDataFile (name, description, price, file) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('description', description)
  formData.append('price', price)
  formData.append('file', file[0])
  return formData
}

async function uploadFileToIPFS (formData) {
  const { data } = await axios.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return data.url
}

export default function CreateItem () {
  const [fileUrl, setFileUrl] = useState(null)
  const { register, handleSubmit } = useForm()
  const router = useRouter()

  async function onFileChange (event) {
    setFileUrl(URL.createObjectURL(event.target.files[0]))
  }

  async function createMarket (price, metadataUrl) {
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

  async function onSubmit ({ name, description, price, file }) {
    const formData = createNFTFormDataFile(name, description, price, file)
    const url = await uploadFileToIPFS(formData)
    await createMarket(price, url)
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            placeholder="NFT Name"
            className="mt-8 border rounded p-4"
            name="name"
            {...register('name')}
          />
          <textarea
            placeholder="NFT Description"
            className="mt-2 border rounded p-4"
            name="description"
            {...register('description')}
          />
          <input
            placeholder="NFT Price"
            className="mt-2 border rounded p-4"
            name="price"
            {...register('price')}
          />
          <input
            type="file"
            name="file"
            className="my-4"
            {...register('file')}
            onChange={onFileChange}
          />
          {
            fileUrl && (
              <img className="rounded mt-4" width="350" src={fileUrl} />
            )
          }
          <button type="submit" className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
            Create Digital NFT
          </button>
        </form>

      </div>
    </div>
  )
}
