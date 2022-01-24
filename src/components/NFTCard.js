
import { useContext } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import { NFTModalContext } from './providers/NFTModalProvider'
import CardAddress from './atoms/CardAddress'
import { Web3Context } from './providers/Web3Provider'
import { ethers } from 'ethers'

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

export default function NFTCard ({ nft, action, updateNFT }) {
  const { setModalNFT, setIsModalOpen } = useContext(NFTModalContext)
  const classes = useStyles()
  const { name, description, image, price } = nft
  const { nftContract, marketplaceContract } = useContext(Web3Context)
  const isSold = action === 'none'
  const sellerAddressTitle = isSold ? 'Last sold by' : 'Seller'
  const priceText = isSold ? `Last sold for ${price} MATIC` : `${price} MATIC`

  const actions = {
    buy: {
      text: 'buy',
      method: buyNft
    },
    cancel: {
      text: 'cancel',
      method: () => alert('Not implemented')
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

  function handleCardImageClick () {
    setModalNFT(nft)
    setIsModalOpen(true)
  }

  async function onClick ({ nft }) {
    await actions[action].method(nft)
    // router.reload(window.location.pathname)
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
        <Typography gutterBottom variant="h6" component="div">
        {priceText}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <CardAddress title="Creator" address={nft.creator} />
        <CardAddress title="Owner" address={nft.owner} />
        <CardAddress title={sellerAddressTitle} address={nft.seller} />
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onClick({ nft })}>{actions[action].text}</Button>
      </CardActions>
    </Card>
  )
}
