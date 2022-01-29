import { Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Web3Context } from '../providers/Web3Provider'

export default function ConnectButton () {
  const { initializeWeb3 } = useContext(Web3Context)
  const [hasWindowEthereum, setHasWindowmEthereum] = useState(false)

  useEffect(() => {
    setHasWindowmEthereum(window.ethereum)
  }, [])

  const buttonText = hasWindowEthereum ? 'Connect' : 'Download Metamask'
  const onClick = () => {
    if (hasWindowEthereum) {
      return initializeWeb3()
    }

    return window.open('https://metamask.io/', '_blank')
  }
  return <Button color="inherit" onClick={onClick}>{buttonText}</Button>
}
