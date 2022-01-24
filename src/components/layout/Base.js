import { useContext } from 'react'
import LowOnBalanceTip from '../molecules/LowOnBalanceTip'
import NavBar from '../NavBar'
import NFTModal from '../NFTModal'
import NFTModalProvider from '../providers/NFTModalProvider'
import { Web3Context } from '../providers/Web3Provider'

export default function BaseLayout ({ children }) {
  const { network, balance, isReady } = useContext(Web3Context)
  const isLowOnEther = balance < 0.1
  return (
    <>
      <NFTModalProvider>
        <NavBar/>
        {isReady && network && isLowOnEther && <LowOnBalanceTip/>}
          {children}
        <NFTModal/>
      </NFTModalProvider>
    </>
  )
}
