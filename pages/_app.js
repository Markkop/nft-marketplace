
import '../styles/globals.css'
import NavBar from '../components/NavBar'

function App ({ Component, pageProps }) {
  return (
    <div>
      <NavBar/>
      <Component {...pageProps} />
    </div>
  )
}

export default App
