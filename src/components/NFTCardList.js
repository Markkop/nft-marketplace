import InfiniteScroll from 'react-infinite-scroll-component'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import { makeStyles } from '@mui/styles'
import NFTCard from './NFTCard'
import CreateNFTCard from './CreateNFTCard'
import SellNFTCard from './SellNFTCard'
import { ethers } from 'ethers'
import { Web3Context } from './providers/Web3Provider'
import { useContext } from 'react'

const useStyles = makeStyles({
  grid: {
    spacing: 3,
    alignItems: 'stretch'
  },
  gridItem: {
    display: 'flex',
    transition: 'all .3s'
  }
})

export default function NFTCardList ({ nfts }) {
  const classes = useStyles()
  const { account } = useContext(Web3Context)

  function NFT ({ nft }) {
    if (!nft.owner) {
      return <CreateNFTCard/>
    }

    if (nft.owner === account) {
      return <SellNFTCard nft={nft}/>
    }

    if (nft.seller === account && !nft.sold) {
      return <NFTCard nft={nft} action="cancel"/>
    }

    if (nft.owner === ethers.constants.AddressZero) {
      return <NFTCard nft={nft} action="buy"/>
    }

    return <NFTCard nft={nft} action="none"/>
  }

  return (
    <InfiniteScroll
      dataLength={nfts.length}
      loader={<LinearProgress />}
    >
      <Grid container className={classes.grid} id="grid">
      {nfts.map(nft =>
        <Grid item xs={12} sm={6} md={3} className={classes.gridItem} key={nft.marketItemId}>
          <NFT nft={nft} key={nft.tokenId} />
        </Grid>
      )}
      </Grid>
    </InfiniteScroll>
  )
}
