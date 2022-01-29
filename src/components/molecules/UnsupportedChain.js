import { Button } from '@mui/material'
import { useContext } from 'react'
import { getProvider, chains } from '../../utils/web3'
import { Web3Context } from '../providers/Web3Provider'
import PageMessageBox from './PageMessageBox'

const toHex = (num) => {
  return '0x' + num.toString(16)
}

async function addNetwork (chain, account) {
  const params = {
    chainId: toHex(chain.chainId), // A 0x-prefixed hexadecimal string
    chainName: chain.name,
    nativeCurrency: {
      name: chain.nativeCurrency.name,
      symbol: chain.nativeCurrency.symbol, // 2-6 characters long
      decimals: chain.nativeCurrency.decimals
    },
    rpcUrls: chain.rpc,
    blockExplorerUrls: [((chain.explorers && chain.explorers.length > 0 && chain.explorers[0].url) ? chain.explorers[0].url : chain.infoURL)]
  }

  window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [params, account]
  }).catch((error) => {
    console.log(error)
  })
}

export default function UnsupportedChain () {
  const { account } = useContext(Web3Context)

  const renderProviderText = () => {
    if (!account) return 'Connect wallet'

    const providerTextList = {
      Metamask: 'Add/Change to Polygon Mumbai Testnet on Metamask',
      imToken: 'Add/Change to Polygon Mumbai Testnet on imToken',
      Wallet: 'Add/Change to Polygon Mumbai Testnet on Wallet'
    }
    return providerTextList[getProvider()]
  }

  return (
    <PageMessageBox
      text="This blockchain is not supported."
    >
      <Button
        variant='outlined'
        color='primary'
        onClick={ () => addNetwork(chains.polygonMumbaiTestnet, account) }
        sx={{
          maxWidth: 600,
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        { renderProviderText() }
      </Button>
    </PageMessageBox>
  )
}
