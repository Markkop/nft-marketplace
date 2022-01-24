import { createContext, useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import NFT from '../../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../../artifacts/contracts/Marketplace.sol/Marketplace.json'
import axios from 'axios'

const contextDefaultValues = {
  account: '',
  network: 'maticmum',
  balance: 0,
  connectWallet: () => {},
  marketplaceContract: null,
  nftContract: null,
  isReady: false
}

const networkNames = {
  maticmum: 'MUMBAI',
  unknown: 'LOCALHOST'
}

export const Web3Context = createContext(
  contextDefaultValues
)

export default function Web3Provider ({ children }) {
  const [account, setAccount] = useState(contextDefaultValues.account)
  const [network, setNetwork] = useState(contextDefaultValues.network)
  const [balance, setBalance] = useState(contextDefaultValues.balance)
  const [marketplaceContract, setMarketplaceContract] = useState(contextDefaultValues.marketplaceContract)
  const [nftContract, setNFTContract] = useState(contextDefaultValues.nftContract)
  const [isReady, setIsReady] = useState(contextDefaultValues.isReady)

  useEffect(() => {
    initializeWeb3()
  }, [])

  async function initializeWeb3 () {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection, 'any')
      window.ethereum.on('accountsChanged', () => getAndSetWeb3Context(provider))
      window.ethereum.on('chainChanged', () => getAndSetWeb3Context(provider))
      getAndSetWeb3Context(provider)
    } catch (error) {
      console.log(error)
    }
  }

  async function getAndSetWeb3Context (provider) {
    if (!provider) return
    setIsReady(false)
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()
    setAccount(signerAddress)
    const signerBalance = await signer.getBalance()
    const balanceInEther = ethers.utils.formatEther(signerBalance, 'ether')
    setBalance(balanceInEther)
    const { name: network } = await provider.getNetwork()
    const networkName = networkNames[network]
    setNetwork(networkName)
    const success = await setupContracts(signer, networkName)
    setIsReady(success)
  }

  async function setupContracts (signer, networkName) {
    if (!networkName) {
      setMarketplaceContract(null)
      setNFTContract(null)
      return false
    }
    const { data } = await axios(`/api/addresses?network=${networkName}`)
    const marketplaceContract = new ethers.Contract(data.marketplaceAddress, Market.abi, signer)
    setMarketplaceContract(marketplaceContract)
    const nftContract = new ethers.Contract(data.nftAddress, NFT.abi, signer)
    setNFTContract(nftContract)
    return true
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        marketplaceContract,
        nftContract,
        isReady,
        network,
        balance,
        initializeWeb3
      }}
    >
      {children}
    </Web3Context.Provider>
  )
};
