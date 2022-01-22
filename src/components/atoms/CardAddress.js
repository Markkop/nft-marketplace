import { Typography } from '@mui/material'
import { ethers } from 'ethers'
import { useContext } from 'react'
import { shortenAddress } from '../../utils/format'
import { Web3Context } from '../providers/Web3Provider'

function getAddressText (address, account) {
  if (address === ethers.constants.AddressZero) return 'Marketplace'
  if (address === account) return 'You'
  return shortenAddress(address)
}

export default function CardAddress ({ title, address }) {
  const { account } = useContext(Web3Context)

  return (
    <Typography variant="body2" color="text.secondary">
      {title}: {getAddressText(address, account)}
    </Typography>
  )
}
