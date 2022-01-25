import { Typography } from '@mui/material'

export default function NFTPrice ({ price, isSold }) {
  const priceText = isSold ? `Last sold for ${price} MATIC` : `${price} MATIC`
  return (
    <Typography
      gutterBottom
      variant="h6"
      component="div"
      >
        {priceText}
    </Typography>
  )
}
