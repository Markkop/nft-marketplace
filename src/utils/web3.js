import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

export async function getSigner () {
  const web3Modal = new Web3Modal()
  const connection = await web3Modal.connect()
  const provider = new ethers.providers.Web3Provider(connection)
  return provider.getSigner
}
