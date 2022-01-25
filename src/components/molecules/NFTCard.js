
import { ethers } from 'ethers'
import { useContext } from 'react'
import { makeStyles } from '@mui/styles'
import { Card, CardActions, CardContent, CardMedia, Button } from '@mui/material'
import { NFTModalContext } from '../providers/NFTModalProvider'
import { Web3Context } from '../providers/Web3Provider'
import CardAddress from '../atoms/CardAddress'
import NFTDescription from '../atoms/NFTDescription'
import NFTPrice from '../atoms/NFTPrice'
import NFTName from '../atoms/NFTName'

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
  const { nftContract, marketplaceContract, hasWeb3 } = useContext(Web3Context)
  const classes = useStyles()
  const { name, description, image, price } = nft
  const isSold = action === 'none'
  const sellerAddressTitle = isSold ? 'Last sold by' : 'Seller'

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
        <NFTName name={name}/>
        <NFTPrice price={price} isSold={isSold}/>
        <NFTDescription description={description} />
        <CardAddress title="Creator" address={nft.creator} />
        <CardAddress title="Owner" address={nft.owner} />
        <CardAddress title={sellerAddressTitle} address={nft.seller} />
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onClick({ nft })}>{hasWeb3 && actions[action].text}</Button>
      </CardActions>
    </Card>
  )
}
