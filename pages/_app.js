import '@/css/tailwind.css'
import '@/css/creditcard.scss'

import { ThemeProvider } from 'next-themes'
import Head from 'next/head'
import { Provider } from 'next-auth/client'

import Analytics from '@/components/analytics'
import LayoutWrapper from '@/components/LayoutWrapper'

import cookie from 'cookie'
import * as React from 'react'

import { SSRKeycloakProvider, SSRCookies } from '@react-keycloak/ssr'

const keycloakCfg = {
	url: 'http://localhost:8080/auth',
	realm: 'CreatorBase',
	clientId: 'CreatorBase-Public',
}

function App({ Component, pageProps, cookies }) {
	return (
		<SSRKeycloakProvider
			keycloakConfig={keycloakCfg}
			persistor={SSRCookies(cookies)}
			initOptions={{
				//onLoad: 'check-sso',
				//silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : '',
				pkceMethod: 'S256',
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
		</SSRKeycloakProvider>
	)
}

function parseCookies(req) {
	if (!req || !req.headers) {
		return {}
	}
	return cookie.parse(req.headers.cookie || '')
}

App.getInitialProps = async (context) => {
	// Extract cookies from AppContext
	return {
		cookies: parseCookies(context?.ctx?.req),
	}
}

export default App
