import PropTypes from 'prop-types'
import Link from 'next/link'
import { Button } from '@mui/material'
import { useRouter } from 'next/router'

export default function NavItem ({ title, href, openNewTab }) {
  const { pathname } = useRouter()
  const isActive = pathname === href
  return (
      <Link href={href} key={title} passHref>
        <Button
          component="a"
          target={openNewTab && '_blank'}
          sx={{
            my: 2,
            color: 'white',
            display: 'block',
            textDecoration: isActive && 'underline',
            '&:hover': {
              backgroundColor: '#fff',
              color: '#3c52b2'
            }
          }}
        >
          {title}
        </Button>
      </Link>
  )
}

NavItem.propTypes = {
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired
}
