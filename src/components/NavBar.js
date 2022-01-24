
import { useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Web3Context } from './providers/Web3Provider'
import { shortenAddress } from '../utils/format'

const pages = [
  {
    title: 'Market',
    href: '/'
  },
  {
    title: 'MY NFTs',
    href: '/creator-dashboard'
  }
]

const NavBar = () => {
  const { account, connectWallet } = useContext(Web3Context)
  const { pathname } = useRouter()
  const logo = '🖼️'

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h3"
            noWrap
            component="div"
            sx={{ flexGrow: { xs: 1, md: 0 }, display: 'flex' }}
          >
            {logo}
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            {pages.map(({ title, href }) => {
              const isActive = pathname === href
              return (
              <Button
                key={title}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                <Link href={href} >
                  <a style={{
                    textDecoration: !isActive && 'none',
                    color: 'white'
                  }}>
                    {title}
                  </a>
                </Link>
              </Button>
              )
            })}
          </Box>
          {shortenAddress(account) || <Button color="inherit" onClick={() => connectWallet()}>Connect</Button> }

        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default NavBar
