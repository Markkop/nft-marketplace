import { shortenAddress } from '../../utils/format'
import { chains } from '../../utils/web3'
import NavItem from './NavItem'

export default function ConnectedAccountAddress ({ account }) {
  const accountUrl = `${chains.polygonMumbaiTestnet.explorers[0].url}/address/${account}`
  return <NavItem title={shortenAddress(account)} href={accountUrl} openNewTab={true}/>
}
