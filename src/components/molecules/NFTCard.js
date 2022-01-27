
import { ethers } from 'ethers'
import { useContext, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Card, CardActions, CardContent, CardMedia, Button, Divider, Box } from '@mui/material'
import { NFTModalContext } from '../providers/NFTModalProvider'
import { Web3Context } from '../providers/Web3Provider'
import NFTDescription from '../atoms/NFTDescription'
import NFTPrice from '../atoms/NFTPrice'
import NFTName from '../atoms/NFTName'
import CardAddresses from './CardAddresses'
import PriceTextField from '../atoms/PriceTextField'

const useStyles = makeStyles({
  root: {
    flexDirection: 'column',
    display: 'flex',
    margin: '15px 15px',
    flexGrow: 1,
    maxWidth: 345
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    cursor: 'pointer'
  },
  cardContent: {
    paddingBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  firstDivider: {
    margin: 'auto 0 10px'
  },
  lastDivider: {
    marginTop: '10px'
  },
  addressesAndPrice: {
    display: 'flex',
    flexDirection: 'row'
  },
  addessesContainer: {
    margin: 'auto',
    width: '60%'
  },
  priceContainer: {
    width: '40%',
    margin: 'auto'
  },
  cardActions: {
    marginTop: 'auto',
    padding: '0 16px 8px 16px'
  }

})

export default function NFTCard ({ nft, action, updateNFT }) {
  const { setModalNFT, setIsModalOpen } = useContext(NFTModalContext)
  const { nftContract, marketplaceContract, hasWeb3 } = useContext(Web3Context)
  const [isHovered, setIsHovered] = useState(false)
  const [newPrice, setPrice] = useState(0)
  const classes = useStyles()
  const { name, description, image, price } = nft
  const isSold = action === 'none'
  const priceLabel = nft.price ? `Price (last time sold for ${nft.price} MATIC)` : 'Price'

  const actions = {
    buy: {
      text: 'buy',
      method: buyNft
    },
    cancel: {
      text: 'cancel',
      method: () => {}
    },
    sell: {
      text: 'sell',
      method: sellNft
    },
    none: {
      text: '',
      method: () => {}
    }
  }

  async function buyNft (nft) {
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await marketplaceContract.createMarketSale(nftContract.address, nft.marketItemId, {
      value: price
    })
    await transaction.wait()
    updateNFT()
  }

  async function sellNft (nft) {
    const listingFee = await marketplaceContract.getListingFee()
    const priceInWei = ethers.utils.parseUnits(newPrice, 'ether')
    const transaction = await marketplaceContract.createMarketItem(nftContract.address, nft.tokenId, priceInWei, { value: listingFee.toString() })
    await transaction.wait()
    updateNFT()
    return transaction
  }

  function handleCardImageClick () {
    setModalNFT(nft)
    setIsModalOpen(true)
  }

  async function onClick (nft) {
    await actions[action].method(nft)
  }

  return (
    <Card
      className={classes.root}
      raised={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      >
      <CardMedia
        className={classes.media}
        alt={name}
        image={image}
        component="a" onClick={handleCardImageClick}
      />

      <CardContent className={classes.cardContent} >
        <NFTName name={name}/>
        <NFTDescription description={description} />
        <Divider className={classes.firstDivider} />
        <Box className={classes.addressesAndPrice}>
          <div className={classes.addessesContainer}>
            <CardAddresses nft={nft} isSold={isSold}/>
          </div>
          <div className={classes.priceContainer}>
            {action === 'sell'
              ? <PriceTextField label={priceLabel} onChange={e => setPrice(e.target.value)}/>
              : <NFTPrice price={price} isSold={isSold}/>
            }
          </div>
        </Box>
        <Divider className={classes.lastDivider} />
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button size="small" onClick={() => onClick(nft)}>{hasWeb3 && actions[action].text}</Button>
      </CardActions>
    </Card>
  )
}
