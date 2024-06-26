const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  reactStrictMode: false,
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

    return config
  },
  images: {
    domains: ['images.unsplash.com', 'static.vantj.com', 'static-dev.vantj.com'],
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
          ],
          source: '/posts',
          destination: '/hosts/:host/posts',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/posts/:slug*',
          destination: '/hosts/:host/posts/:slug*',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/posts/page/:page',
          destination: '/hosts/:host/posts/page/:page',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/tags',
          destination: '/hosts/:host/tags',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/tags/:tag*',
          destination: '/hosts/:host/tags/:tag*',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/profile',
          destination: '/hosts/:host/profile',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/profile/edit',
          destination: '/hosts/:host/profile/edit',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/subscriptions',
          destination: '/hosts/:host/subscriptions',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/subscriptions/:id*',
          destination: '/hosts/:host/subscriptions/:id*',
        },
        {
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
          source: '/about',
          destination: '/hosts/:host/about',
        },
      ],
    }
  },
})
