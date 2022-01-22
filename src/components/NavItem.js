import PropTypes from 'prop-types'
import Link from 'next/link'

export default function NavItem ({ title, href }) {
  return (
    <Link href={href} className="navbar-item">
      <a className="mr-4 text-pink-500">
        {title}
      </a>
    </Link>
  )
}

NavItem.propTypes = {
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired
}
