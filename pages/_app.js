import * as React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider } from '@emotion/react'
import theme from '../src/theme'
import createEmotionCache from '../src/createEmotionCache'
import Web3Provider from '../src/components/providers/Web3Provider'
import { StylesProvider, createGenerateClassName } from '@mui/styles'
import BaseLayout from '../src/components/layout/Base'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

const generateClassName = createGenerateClassName({
  productionPrefix: 'c'
})

export default function MyApp (props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <StylesProvider generateClassName={generateClassName}>
      <Web3Provider>
        <CacheProvider value={emotionCache}>
          <Head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <ThemeProvider theme={theme}>
              <CssBaseline />
              <BaseLayout>
                <Component {...pageProps} />
              </BaseLayout>
          </ThemeProvider>
        </CacheProvider>
      </Web3Provider>
    </StylesProvider>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired
}
