import { createContext, useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import NFT from '../../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../../artifacts/contracts/Marketplace.sol/Marketplace.json'
import axios from 'axios'

const contextDefaultValues = {
  account: '',
  signer: null,
  network: 'maticmum',
  balance: 0,
  isConnected: false,
  setAccount: () => {},
  connectWallet: () => {},
  setIsConnected: () => {},
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
  const [signer, setSigner] = useState(contextDefaultValues.signer)
  const [network, setNetwork] = useState(contextDefaultValues.network)
  const [balance, setBalance] = useState(contextDefaultValues.balance)
  const [isConnected, setIsConnected] = useState(contextDefaultValues.isConnected)
  const [isReady, setIsReady] = useState(contextDefaultValues.isReady)
  const [marketplaceContract, setMarketplaceContract] = useState(contextDefaultValues.marketplaceContract)
  const [nftContract, setNFTContract] = useState(contextDefaultValues.nftContract)

  useEffect(() => {
    initializeWeb3()
  }, [])

  async function initializeWeb3 () {
    const { signer, networkName } = await connectWallet()
    if (!networkName) return
    await setupContracts(signer, networkName)
  }

  async function onAccountChange () {
    const signer = await connectWallet()
    setSigner(signer)
    const signerAddress = await signer.getAddress()
    setAccount(signerAddress)
  }

  async function connectWallet () {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection, 'any')
    window.ethereum.on('accountsChanged', onAccountChange)
    window.ethereum.on('chainChanged', initializeWeb3)
    const signer = provider.getSigner()
    setSigner(signer)
    const signerAddress = await signer.getAddress()
    setAccount(signerAddress)
    const signerBalance = await signer.getBalance()
    const balanceInEther = ethers.utils.formatEther(signerBalance, 'ether')
    setBalance(balanceInEther)
    const { name: network } = await provider.getNetwork()
    const networkName = networkNames[network]
    setNetwork(networkName)
    return { signer, networkName }
  }

  async function setupContracts (signer, networkName) {
    const { data } = await axios(`/api/addresses?network=${networkName}`)
    const marketplaceContract = new ethers.Contract(data.marketplaceAddress, Market.abi, signer)
    setMarketplaceContract(marketplaceContract)
    const nftContract = new ethers.Contract(data.nftAddress, NFT.abi, signer)
    setNFTContract(nftContract)
    setIsReady(true)
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        signer,
        isConnected,
        setAccount,
        setIsConnected,
        connectWallet,
        marketplaceContract,
        nftContract,
        isReady,
        network,
        balance
      }}
    >
      {children}
    </Web3Context.Provider>
  )
};
