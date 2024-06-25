import React, { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useSession } from 'next-auth/react'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import { Cog8ToothIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const StripeCheckoutForm = ({ selectedPrice, setMode }) => {
  const { data: session, status } = useSession()
  const stripe = useStripe()
  const elements = useElements()

  const mode = selectedPrice?.uom_abbreviation === 'each' ? 'payment' : 'subscription'

  const [errorMessage, setErrorMessage] = useState()
  const [loading, setLoading] = useState(false)

  const handleError = (error) => {
    setLoading(false)
    setErrorMessage(error.message)
  }

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault()

    if (!stripe) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setLoading(true)

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit()
    if (submitError) {
      handleError(submitError)
      return
    }

    // Create the clientSecret
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API}/api/payment/create_external_subscription`,
      'POST',
      session?.accessToken,
      { priceId: selectedPrice.price_component_id, mode }
    )
    const clientSecret = response.latest_invoice?.payment_intent?.client_secret

    // Confirm the Intent using the details collected by the Payment Element
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location + 'subscriptions', // direct to the exact purchase ID details
      },
    })

    if (error) {
      // This point is only reached if there's an immediate error when confirming the Intent.
      // Show the error to your customer (for example, "payment details incomplete").
      handleError(error)
    } else {
      // Your customer is redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer is redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <PaymentElement />
        <button
          type="submit"
          disabled={!stripe || loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white font-semibold bg-indigo-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            {loading ? (
              <Cog8ToothIcon
                className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300"
                aria-hidden="true"
              />
            ) : (
              <LockClosedIcon
                className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300"
                aria-hidden="true"
              />
            )}
          </span>
          {loading ? 'Processing...' : 'Confirm Payment'}
        </button>
      </form>
      {errorMessage && <div>{errorMessage}</div>}
    </>
  )
}

export default StripeCheckoutForm
