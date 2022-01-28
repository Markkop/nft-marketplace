import { Popover, Typography } from '@mui/material'
import Image from 'next/image'
import { useState } from 'react'

function getPriceText (nft) {
  const { sold, canceled } = nft
  if (sold) {
    return 'Sold for'
  }

  if (canceled) {
    return 'Offered for'
  }

  return 'Price'
}

export default function NFTPrice ({ nft }) {
  const priceText = getPriceText(nft)
  const [anchorEl, setAnchorEl] = useState(null)

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  return (
    <div style={{ textAlign: 'center' }}>

      <Typography
      variant="h6"
      color="text.secondary"
      >
        {priceText}
      </Typography>
      <Typography
      gutterBottom
      variant="h6"
      color="text.secondary"
      >
        <span style={{ display: 'inline-block', transform: 'translateY(3px)' }}>
          <Image
            alt='Matic'
            src='/matic.png'
            width="20px"
            height="20px"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
          />
        </span>
        <Popover
          id="mouse-over-popover"
          sx={{
            pointerEvents: 'none'
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ p: 1 }}>Matic</Typography>
        </Popover>
        {' '}{nft.price}
      </Typography>
    </div>
  )
}
