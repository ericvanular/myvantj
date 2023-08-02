import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise

export const getStripe = (connectedAccountId) => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        '',
      {
        stripeAccount: connectedAccountId,
      }
    )
  }
  return stripePromise
}
