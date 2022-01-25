import { Button } from '@mui/material'
import { useContext } from 'react'
import { Web3Context } from '../providers/Web3Provider'

export default function ConnectButton () {
  const { initializeWeb3, hasWeb3 } = useContext(Web3Context)
  const buttonText = hasWeb3 ? 'Connect' : 'Download Metamask'
  const onClick = () => {
    if (hasWeb3) {
      return initializeWeb3()
    }

    return window.open('https://metamask.io/', '_blank')
  }
  return <Button color="inherit" onClick={onClick}>{buttonText}</Button>
}
