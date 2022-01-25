import InfiniteScroll from 'react-infinite-scroll-component'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Fade from '@mui/material/Fade'
import { makeStyles } from '@mui/styles'
import NFTCard from '../molecules/NFTCard'
import CreateNFTCard from '../molecules/CreateNFTCard'
import SellNFTCard from '../molecules/SellNFTCard'
import { ethers } from 'ethers'
import { Web3Context } from '../providers/Web3Provider'
import { useContext } from 'react'
import { getNFTById } from '../../utils/nft'

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

export default function NFTCardList ({ nfts, setNfts, withCreateNFT }) {
  const classes = useStyles()
  const { account, marketplaceContract, nftContract } = useContext(Web3Context)

  async function updateNFT (index, tokenId) {
    const updatedNFt = await getNFTById(nftContract, marketplaceContract, account, tokenId)
    setNfts(prevNfts => {
      const updatedNfts = [...prevNfts]
      updatedNfts[index] = updatedNFt
      return updatedNfts
    })
  }

  async function addNFTToList (tokenId) {
    const nft = await getNFTById(nftContract, marketplaceContract, account, tokenId)
    setNfts(prevNfts => [nft, ...prevNfts])
  }

  function NFT ({ nft, index }) {
    if (!nft.owner) {
      return <CreateNFTCard addNFTToList={addNFTToList}/>
    }

    if (nft.owner === account) {
      return <SellNFTCard nft={nft} updateNFT={() => updateNFT(index, nft.tokenId)}/>
    }

    if (nft.seller === account && !nft.sold) {
      return <NFTCard nft={nft} updateNFT={() => updateNFT(index, nft.tokenId)} action="cancel"/>
    }

    if (nft.owner === ethers.constants.AddressZero) {
      return <NFTCard nft={nft} updateNFT={() => updateNFT(index, nft.tokenId)} action="buy"/>
    }

    return <NFTCard nft={nft} action="none"/>
  }

  return (
    <InfiniteScroll
      dataLength={nfts.length}
      loader={<LinearProgress />}
    >
      <Grid container className={classes.grid} id="grid">
        {withCreateNFT && <Grid item xs={12} sm={6} md={3} className={classes.gridItem}>
          <CreateNFTCard addNFTToList={addNFTToList}/>
        </Grid>}
        {nfts.map((nft, i) =>
          <Fade in={true} key={i}>
            <Grid item xs={12} sm={6} md={3} className={classes.gridItem} >
                <NFT nft={nft} index={i} />
            </Grid>
          </Fade>
        )}
      </Grid>
    </InfiniteScroll>
  )
}
