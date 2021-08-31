import '@/css/tailwind.css'

import { ThemeProvider } from 'next-themes'
import Head from 'next/head'
import { Provider } from 'next-auth/client'

import Analytics from '@/components/analytics'
import LayoutWrapper from '@/components/LayoutWrapper'

export default function App({ Component, pageProps }) {
    return (
        <Provider session={pageProps.session}>
            <ThemeProvider attribute="class">
                <Head>
                    <meta content="width=device-width, initial-scale=1" name="viewport" />
                </Head>
                <Analytics />
                <LayoutWrapper>
                    <Component {...pageProps} />
                </LayoutWrapper>
            </ThemeProvider>
        </Provider>
    )
}
