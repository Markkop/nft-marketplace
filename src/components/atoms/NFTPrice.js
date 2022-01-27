import { Typography } from '@mui/material'

export default function NFTPrice ({ price, isSold }) {
  const priceText = isSold ? `Last sold for ${price} MATIC` : `${price}`
  return (
    <div style={{ textAlign: 'center' }}>
      <Typography
      variant="h6"
      color="text.secondary"
      >
        Price
      </Typography>
      <Typography
      gutterBottom
      variant="h6"
      color="text.secondary"
      >
        {priceText}
      </Typography>
    </div>
  )
}
