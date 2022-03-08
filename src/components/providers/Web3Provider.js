import { createContext, useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import NFT from '../../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../../artifacts/contracts/Marketplace.sol/Marketplace.json'
import ERC20 from '../../../artifacts/contracts/MarkToken.sol/MarkToken.json'
import axios from 'axios'

const contextDefaultValues = {
  account: '',
  network: 'maticmum',
  balance: 0,
  connectWallet: () => {},
  marketplaceContract: null,
  nftContract: null,
  erc20Contract: null,
  isReady: false,
  hasWeb3: false
}

const networkNames = {
  maticmum: 'MUMBAI',
  unknown: 'LOCALHOST'
}

export const Web3Context = createContext(
  contextDefaultValues
)

export default function Web3Provider ({ children }) {
  const [hasWeb3, setHasWeb3] = useState(contextDefaultValues.hasWeb3)
  const [account, setAccount] = useState(contextDefaultValues.account)
  const [network, setNetwork] = useState(contextDefaultValues.network)
  const [balance, setBalance] = useState(contextDefaultValues.balance)
  const [marketplaceContract, setMarketplaceContract] = useState(contextDefaultValues.marketplaceContract)
  const [nftContract, setNFTContract] = useState(contextDefaultValues.nftContract)
  const [erc20Contract, setERC20Contract] = useState(contextDefaultValues.erc20Contract)
  const [isReady, setIsReady] = useState(contextDefaultValues.isReady)

  useEffect(() => {
    initializeWeb3()
  }, [])

  async function initializeWeb3WithoutSigner () {
    const alchemyProvider = new ethers.providers.AlchemyProvider(80001)
    setHasWeb3(false)
    await getAndSetWeb3ContextWithoutSigner(alchemyProvider)
  }

  async function initializeWeb3 () {
    try {
      if (!window.ethereum) {
        await initializeWeb3WithoutSigner()
        return
      }

      let onAccountsChangedCooldown = false
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      setHasWeb3(true)
      const provider = new ethers.providers.Web3Provider(connection, 'any')
      await getAndSetWeb3ContextWithSigner(provider)

      function onAccountsChanged (accounts) {
        // Workaround to accountsChanged metamask mobile bug
        if (onAccountsChangedCooldown) return
        onAccountsChangedCooldown = true
        setTimeout(() => { onAccountsChangedCooldown = false }, 1000)
        const changedAddress = ethers.utils.getAddress(accounts[0])
        return getAndSetAccountAndBalance(provider, changedAddress)
      }

      connection.on('accountsChanged', onAccountsChanged)
      connection.on('chainChanged', initializeWeb3)
    } catch (error) {
      initializeWeb3WithoutSigner()
      console.log(error)
    }
  }

  async function getAndSetWeb3ContextWithSigner (provider) {
    setIsReady(false)
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()
    await getAndSetAccountAndBalance(provider, signerAddress)
    const networkName = await getAndSetNetwork(provider)
    const success = await setupContracts(signer, networkName)
    setIsReady(success)
  }

  async function getAndSetWeb3ContextWithoutSigner (provider) {
    setIsReady(false)
    const networkName = await getAndSetNetwork(provider)
    const success = await setupContracts(provider, networkName)
    setIsReady(success)
  }

  async function getAndSetAccountAndBalance (provider, address) {
    setAccount(address)
    const signerBalance = await provider.getBalance(address)
    const balanceInEther = ethers.utils.formatEther(signerBalance, 'ether')
    setBalance(balanceInEther)
  }

  async function getAndSetNetwork (provider) {
    const { name: network } = await provider.getNetwork()
    const networkName = networkNames[network]
    setNetwork(networkName)
    return networkName
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
    const erc20Contract = new ethers.Contract(data.erc20Address, ERC20.abi, signer)
    setERC20Contract(erc20Contract)
    return true
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        marketplaceContract,
        nftContract,
        erc20Contract,
        isReady,
        network,
        balance,
        initializeWeb3,
        hasWeb3
      }}
    >
      {children}
    </Web3Context.Provider>
  )
};
