import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID,
      clientSecret: process.env.KEYCLOAK_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
      }
      return token
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken
      session.idToken = token.idToken
      return session
    },
  },
}

export default async function auth(req, res) {
  const { host } = req.headers

  if (!host) return res.status(400).send(`Bad Request, missing host header`)

  const tenantSlug = host.includes(`.`) ? host.split(`.`)[0] : null

  if (!tenantSlug) {
    res.status(400).send(`Bad Request, missing tenant name as subdomain`)
    return null
  }

  process.env.NEXTAUTH_URL = /localhost/.test(host) ? `http://${host}` : host

  // await tenants.ready;
  // const tenants = {vantj: 'csncak'}
  // const tenant = await tenants.get(tenantSlug);

  // if (!tenant) {
  //   res.status(400).send(`Bad Request, tenant ${tenantSlug} not found`);
  //   return null;
  // }

  // return NextAuth(getOptions(tenant.id))(req, res);
  return await NextAuth(req, res, authOptions)
}

// export default NextAuth(authOptions)

// import NextAuth from 'next-auth'
// import Providers from 'next-auth/providers'

// const useSecureCookies = process.env.NEXTAUTH_URL.startsWith('https://')
// const cookiePrefix = useSecureCookies ? '__Secure-' : ''
// const hostName = new URL(process.env.NEXTAUTH_URL).hostname
// const domain = hostName === 'localhost' ? hostName : '.' + hostName // add a . in front so that subdomains are included

// const options = {
// 	providers: [
// 		Providers.Credentials({
// 			// The name to display on the sign in form (e.g. 'Sign in with...')
// 			name: 'CreatorBase',
// 			// The credentials is used to generate a suitable form on the sign in page.
// 			// You can specify whatever fields you are expecting to be submitted.
// 			// e.g. domain, username, password, 2FA token, etc.
// 			credentials: {
// 				email: { label: 'Email', type: 'email', placeholder: 'you@email.com' },
// 				password: { label: 'Password', type: 'password' },
// 			},
// 			async authorize(credentials, req) {
// 				// You need to provide your own logic here that takes the credentials
// 				// submitted and returns either a object representing a user or value
// 				// that is false/null if the credentials are invalid.
// 				// e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
// 				// You can also use the `req` object to obtain additional parameters
// 				// (i.e., the request IP address)
// 				const res = await fetch('http://localhost:5000/api/auth/login/external', {
// 					method: 'POST',
// 					body: JSON.stringify(credentials),
// 					headers: { 'Content-Type': 'application/json' },
// 					credentials: 'include',
// 				})
// 				const user = await res.json()

// 				// If no error and we have user data, return it
// 				if (res.ok && user) {
// 					return user
// 				}
// 				// Return null if user data could not be retrieved
// 				return null
// 			},
// 		}),
// 	],
// 	callbacks: {
// 		async jwt(token, user, account, profile, isNewUser) {
// 			// Add access_token to the token right after signin
// 			if (user?.access_token) {
// 				token.accessToken = user.access_token
// 			}
// 			if (user?.username) {
// 				token.username = user.username
// 			}
// 			return token
// 		},
// 		async session(session, token) {
// 			// Add property to session, like an access_token from a provider.
// 			session.accessToken = token.accessToken
// 			session.user = { username: token.username }
// 			return session
// 		},
// 	},
// 	// Cross Origin cookies policy to allow subdomains
// 	cookies: {
// 		sessionToken: {
// 			name: `${cookiePrefix}next-auth.session-token`,
// 			options: {
// 				httpOnly: false,
// 				sameSite: 'none',
// 				path: '/',
// 				secure: true, //useSecureCookies,
// 				domain: hostName,
// 			},
// 		},
// 	},
// }

// export default (req, res) => NextAuth(req, res, options)
