
import { useState, useContext } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { makeStyles } from '@mui/styles'
import { NFTModalContext } from './providers/NFTModalProvider'
import { Web3Context } from './providers/Web3Provider'
import { ethers } from 'ethers'
import CardAddress from './atoms/CardAddress'

const useStyles = makeStyles({
  root: {
    flexDirection: 'column',
    display: 'flex',
    margin: '15px 15px',
    flexGrow: 1
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    cursor: 'pointer'
  }
})

export default function NFTCard ({ nft, updateNFT }) {
  const { setModalNFT, setIsModalOpen } = useContext(NFTModalContext)
  const [price, setPrice] = useState(0)
  const classes = useStyles()
  const { name, description, image } = nft
  const { nftContract, marketplaceContract } = useContext(Web3Context)
  const priceLabel = nft.price ? `Price (last time sold for ${nft.price} ETH)` : 'Price'

  async function sellNft (nftTokenId, priceInEther) {
    const listingFee = await marketplaceContract.getListingFee()
    const priceInWei = ethers.utils.parseUnits(priceInEther, 'ether')
    const transaction = await marketplaceContract.createMarketItem(nftContract.address, nftTokenId, priceInWei, { value: listingFee.toString() })
    await transaction.wait()
    return transaction
  }

  function handleCardImageClick () {
    setModalNFT(nft)
    setIsModalOpen(true)
  }

  async function onSell ({ nft }) {
    await sellNft(nft.tokenId, price)
    updateNFT()
  }

  return (
    <Card className={classes.root} sx={{ maxWidth: 345 }}>
      <CardContent>
        <CardMedia
          className={classes.media}
          alt={name}
          image={image}
          component="a" onClick={handleCardImageClick}
        />
        <Typography gutterBottom variant="h5" component="div">
          {name}
        </Typography>
        <TextField
          id="price-input"
          label={priceLabel}
          name="price"
          size="small"
          fullWidth
          required
          margin="dense"
          type="number"
          inputProps={{ step: 'any' }}
          onChange={e => setPrice(e.target.value)}
        />
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <CardAddress title="Creator" address={nft.creator} />
        <CardAddress title="Owner" address={nft.owner} />
        {nft.seller && <CardAddress title="Last sold by" address={nft.seller} />}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onSell({ nft })}>Sell</Button>
      </CardActions>
    </Card>
  )
}
