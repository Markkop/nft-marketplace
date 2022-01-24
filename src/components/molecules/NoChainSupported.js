import { Box, Button, Container, Typography } from '@mui/material'
import { useContext } from 'react'
import { getProvider } from '../../utils/web3'
import { Web3Context } from '../providers/Web3Provider'

const toHex = (num) => {
  return '0x' + num.toString(16)
}

const chains = {
  polygonMumbaiTestnet: {
    name: 'Polygon Testnet Mumbai',
    chain: 'Polygon',
    rpc: [
      'https://matic-mumbai.chainstacklabs.com',
      'https://rpc-mumbai.maticvigil.com',
      'https://matic-testnet-archive-rpc.bwarelabs.com'
    ],
    faucets: [
      'https://faucet.polygon.technology/'
    ],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    infoURL: 'https://polygon.technology/',
    shortName: 'maticmum',
    chainId: 80001,
    networkId: 80001,
    explorers: [{
      name: 'polygonscan',
      url: 'https://mumbai.polygonscan.com',
      standard: 'EIP3091'
    }]
  }
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
  })
    .then((result) => {
      console.log(result)
    })
    .catch((error) => {
      console.log(error)
    })
}

export default function NoChainSupported () {
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
    <Container >
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        flexShrink: 1,
        p: 1,
        m: 1
      }} >
        <Typography variant="body3" color="text.secondary" >
          This blockchain is not supported.
        </Typography>
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
      </Box>
    </Container>
  )
}
