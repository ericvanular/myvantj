import React, { useState, useCallback, useContext } from 'react'
import Modal from '../Modal'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import { SiteContext } from 'pages/_app'
import { useSWRConfig } from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'
import RegisterForm from '../RegisterForm'
// import CheckoutBTC from '../CheckoutBTC'
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/utils/stripe-client'
// import {
//   socket,
//   initiateSocket,
//   disconnectSocket,
//   subscribeToTransactions,
// } from '@/lib/utils/socketUtils'
import StripeCheckoutForm from './StripeCheckoutForm'

export default function StripePaymentsModal({ open, setOpen, selectedPrice }) {
  const [mode, setMode] = useState('checkoutStripe')

  const { data: session, status } = useSession()
  const { partyData } = useContext(SiteContext)
  const { mutate } = useSWRConfig()

  // const options = {
  //   // passing the client secret obtained from the initial Stripe API call
  //   clientSecret: stripeData?.latest_invoice?.payment_intent?.client_secret,
  //   // Fully customizable with appearance API.
  //   // appearance: {/*...*/},
  // }

  const [discountedAmount, setDiscountedAmount] = useState(null)

  const handleDiscountCode = useCallback(async (promoCode, priceId) => {
    if (!promoCode) {
      setDiscountedAmount(null)
      return
    }
    // On the server, validate that the discount code is valid and return the new amount
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API}/api/payment/validate-promo-code`,
      'POST',
      session?.accessToken,
      { promoCode, priceId }
    )
    if (response.discounted_amount) {
      // Trigger a state change that re-renders the Elements provider with the new amount
      setDiscountedAmount(response.discounted_amount)
    } else {
      console.log(response)
    }
  }, [])

  const options = {
    mode: selectedPrice?.uom_abbreviation === 'each' ? 'payment' : 'subscription',
    currency: 'usd',
    amount:
      discountedAmount ||
      Math.round((Math.abs(selectedPrice?.price_component_price) / 100) * 10000),
    // Fully customizable with appearance API.
    appearance: {
      /*...*/
    },
  }

  const stripePromise = getStripe(partyData?.payment_external_account_id)

  const [errorMessage, setErrorMessage] = useState(null)

  // const handleFollowCheckout = async () => {
  //   setMode('unpaid')
  //   const response = await fetchWithToken(
  //     `${process.env.NEXT_PUBLIC_API}/api/patron/btcfollow/${name}`,
  //     'POST',
  //     session?.accessToken
  //   )
  //   if (response.data?.uri) {
  //     setCharge(response.data)
  //     setMode('checkout')
  //   } else {
  //     console.log(response)
  //     setMode(['failure', response.error])
  //   }
  // }

  const resetModalStatus = () => {
    setOpen(false)
    setMode('checkoutStripe')
  }

  const modalHeader = (mode) => {
    switch (mode) {
      case 'cancel':
        return 'Cancel Subscription?'
      case 'canceled':
        return 'Subscription Canceled!'
      case 'pause':
        return 'Pause Subscription?'
      case 'paused':
        return 'Subscription Paused!'
      case 'paid':
        return 'Payment Successful!'
      default:
        return `Confirm Payment`
    }
  }

  const formattedPriceString = (amount, baseUnit = 'dollars') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // price.currency,
      minimumFractionDigits: 2,
    }).format(baseUnit === 'dollars' ? amount : amount / 100)
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      {session?.accessToken ? (
        <>
          {/*header*/}
          <div className="flex items-center justify-between p-4 border-b border-solid border-blueGray-200 rounded-t">
            <h2 className="text-3xl text-black font-semibold">{modalHeader(mode)}</h2>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={resetModalStatus}
            >
              <span className="bg-transparent text-black text-3xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {/*body*/}
          <div className="relative p-6 flex-auto">
            {mode === 'checkoutStripe' ? (
              <>
                <div className="mb-4 dark:text-gray-900 bg-green-50 p-3 rounded border">
                  <div>
                    <b>Product: </b>
                    {selectedPrice?.product?.name}
                  </div>
                  <div>
                    <b>Amount: </b>
                    <span className={discountedAmount && 'line-through decoration-2'}>
                      {formattedPriceString(selectedPrice?.price_component_price)}
                    </span>
                    {discountedAmount && (
                      <span className="ml-2">
                        {formattedPriceString(discountedAmount, 'cents')}
                      </span>
                    )}
                  </div>
                  <div>
                    <b>Frequency: </b>
                    {selectedPrice?.uom_abbreviation === 'each'
                      ? 'One-Time Purchase'
                      : 'per ' + selectedPrice?.uom_abbreviation}
                  </div>
                </div>
                <Elements stripe={stripePromise} options={options}>
                  <StripeCheckoutForm
                    selectedPrice={selectedPrice}
                    setMode={setMode}
                    discountedAmount={discountedAmount}
                    setDiscountedAmount={setDiscountedAmount}
                    onDiscountCode={handleDiscountCode}
                  />
                </Elements>
              </>
            ) : (
              mode === 'paid' && (
                <div className="flex justify-center items-center flex-col">
                  <h2 className="m-4 text-xl">Your payment was made successfully! Thank you</h2>
                </div>
              )
            )}
          </div>
        </>
      ) : (
        <RegisterForm signUpSubtext={`To get started with  ${name}!`} partyData={partyData} />
      )}
    </Modal>
  )
}
