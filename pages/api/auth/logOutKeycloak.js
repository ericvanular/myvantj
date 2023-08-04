import { getToken } from 'next-auth/jwt'
// import { authOptions } from 'pages/api/auth/[...nextauth]'
// import { getServerSession } from 'next-auth'

export default async (req, res) => {
  const { host } = req.headers
  if (!host) return res.status(400).send(`Bad Request, missing host header`)
  process.env.NEXTAUTH_URL = /localhost/.test(host) ? `http://${host}` : `https://${host}`

  const secret = process.env.NEXTAUTH_SECRET

  const token = await getToken({
    req,
    secret,
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
  })
  // const session = await getServerSession(req, res, authOptions)

  let path = `${
    process.env.KEYCLOAK_ISSUER
  }/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
    process.env.NEXTAUTH_URL
  )}`

  if (token?.idToken) {
    path = path + `&id_token_hint=${token.idToken}`
  } else {
    path = path + `&client_id=${process.env.KEYCLOAK_ID}`
  }

  res.status(200).json({ path })
}
