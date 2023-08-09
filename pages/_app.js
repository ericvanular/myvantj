import '@/css/tailwind.css'
import '@/css/creditcard.scss'
import '@/css/custom.css'

import { ThemeProvider } from 'next-themes'
import Head from 'next/head'

import Analytics from '@/components/analytics'
import LayoutWrapper from '@/components/LayoutWrapper'

import cookie from 'cookie'
import React, { useState, useEffect, useRef, createContext } from 'react'
import useSWR from 'swr'
import fetchWithToken from '@/lib/utils/fetchWithToken'

// import { AuthProvider } from 'react-oidc-context'
// import { SSRKeycloakProvider, SSRCookies } from '@react-keycloak-fork/ssr'
import { SessionProvider } from 'next-auth/react'

const keycloakCfg = {
  url: 'https://auth.vantj.com', // process.env.NEXT_PUBLIC_IDP_URL,
  realm: 'Vantj',
  clientId: 'Vantj-Public',
}

const oidcConfig = {
  authority: 'https://auth.vantj.com/realms/Vantj/',
  client_id: 'Vantj-Public',
  redirect_uri: 'http://localhost:3001',
  // ...
}

export const SiteContext = createContext()

function App({ Component, pageProps: { session, ...pageProps }, cookies }) {
  const { data: partyData, error: partyError } = useSWR(
    typeof window !== 'undefined'
      ? [
          `${process.env.NEXT_PUBLIC_API}/api/company/${window.location.hostname.split('.')[0]}`,
          'GET',
          session?.accessToken,
        ]
      : null,
    ([url, method, token]) => fetchWithToken(url, method, token)
  )

  return (
    // <AuthProvider {...oidcConfig}>
    // <SSRKeycloakProvider
    //   keycloakConfig={keycloakCfg}
    //   persistor={SSRCookies(cookies)}
    //   initOptions={{
    //     // onLoad: 'check-sso',
    //     // silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : '',
    //     pkceMethod: 'S256',
    //   }}
    // >
    <SessionProvider session={session}>
      <SiteContext.Provider
        value={{
          partyData: partyData?.org,
        }}
      >
        <ThemeProvider attribute="class">
          <Head>
            <meta content="width=device-width, initial-scale=1" name="viewport" />
          </Head>
          <Analytics />
          <LayoutWrapper>
            <Component {...pageProps} />
          </LayoutWrapper>
        </ThemeProvider>
      </SiteContext.Provider>
    </SessionProvider>
    // </SSRKeycloakProvider>
    // </AuthProvider>
  )
}

// function parseCookies(req) {
//   if (!req || !req.headers) {
//     return {}
//   }
//   return cookie.parse(req.headers.cookie || '')
// }

// App.getInitialProps = async (context) => {
//   // Extract cookies from AppContext
//   return {
//     cookies: parseCookies(context?.ctx?.req),
//   }
// }

export default App
