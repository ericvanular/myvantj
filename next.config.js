const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
    reactStrictMode: true,
    pageExtensions: ['js', 'jsx', 'md', 'mdx'],
    eslint: {
        dirs: ['pages', 'components', 'lib', 'layouts', 'scripts'],
    },
    experimental: { esmExternals: true },
    webpack: (config, { dev, isServer }) => {
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|mp4)$/i,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        publicPath: '/_next',
                        name: 'static/media/[name].[hash].[ext]',
                    },
                },
            ],
        })

        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        })

        if (!dev && !isServer) {
            // Replace React with Preact only in client production build
            Object.assign(config.resolve.alias, {
                react: 'preact/compat',
                'react-dom/test-utils': 'preact/test-utils',
                'react-dom': 'preact/compat',
            })
        }

        return config
    },
    images: {
        domains: ['images.unsplash.com', 'static.jetpeak.co', 'f000.backblazeb2.com'],
    },
    async rewrites() {
        return {
            afterFiles: [
                {
                    has: [
                        {
                            type: 'host',
                            value: '(?<host>.*)',
                        },
                    ],
                    source: '/',
                    destination: '/hosts/:host',
                },
                {
                    has: [
                        {
                            type: 'host',
                            value: '(?<host>.*)',
                        },
                        {
                            type: 'header',
                            key: 'accept-encoding',
                            value: '(?<encoding>.*)',
                        },
                        {
                            type: 'query',
                            key: 'x',
                            value: '(?<x>.*)',
                        },
                    ],
                    source: '/headers/:slug*',
                    destination: '/headers/:slug*/host/:host/encoding/:encoding/x/:x',
                },
                {
                    has: [
                        {
                            type: 'host',
                            value: '(?<host>.*)',
                        },
                        {
                            type: 'header',
                            key: 'accept-encoding',
                            value: '(?<encoding>.*)',
                        },
                    ],
                    source: '/headers/:slug*',
                    destination: '/headers/:slug*/host/:host/encoding/:encoding/x/null',
                },
                {
                    has: [
                        {
                            type: 'host',
                            value: '(?<host>.*)',
                        },
                    ],
                    source: '/headers/:slug*',
                    destination: '/headers/:slug*/host/:host/encoding/null/x/null',
                },
                {
                    has: [
                        {
                            type: 'host',
                            value: '(?<host>.*)',
                        },
                    ],
                    source: '/posts/:id',
                    destination: '/hosts/:host/posts/:id',
                },
                {
                    has: [
                        {
                            type: 'host',
                            value: '(?<host>.*)',
                        },
                    ],
                    source: '/slugs/:slug*',
                    destination: '/hosts/:host/slugs/:slug*',
                },
            ],
        }
    },
    async headers() {
        // To help with local development...
        if (process.env.NEXT_PUBLIC_ENV === 'development') {
            return [
                {
                    source: '/api/auth/:path*',
                    headers: [
                        { key: 'Access-Control-Allow-Credentials', value: 'true' },
                        { key: 'Access-Control-Allow-Origin', value: '*' },
                        {
                            key: 'Access-Control-Allow-Methods',
                            value: 'GET, OPTIONS, PATCH, DELETE, POST, PUT',
                        },
                        {
                            key: 'Access-Control-Allow-Headers',
                            value:
                                'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                        },
                    ],
                },
            ]
        }

        // In the other environments...
        return [
            // https://vercel.com/support/articles/how-to-enable-cors#enabling-cors-in-a-next.js-app
            // https://nextjs.org/docs/api-reference/next.config.js/headers#header-cookie-and-query-matching
            {
                // matching all auth API routes
                source: '/api/auth/:path*',
                // if the origin has '.my-domain.com'...
                has: [
                    {
                        type: 'header',
                        key: 'Origin',
                        value: '(?<serviceName>^https://.*.my-domain.com$)',
                    },
                ],
                // these headers will be applied
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, OPTIONS, PATCH, DELETE, POST, PUT',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value:
                            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                    },
                ],
            },
        ]
    },
})
