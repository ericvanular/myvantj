import React, { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useSession } from 'next-auth/react'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import { Cog8ToothIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const StripeCheckoutForm = ({
  selectedPrice,
  setMode,
  discountedAmount,
  setDiscountedAmount,
  onDiscountCode,
}) => {
  const { data: session, status } = useSession()
  const stripe = useStripe()
  const elements = useElements()

  const mode = selectedPrice?.uom_abbreviation === 'each' ? 'payment' : 'subscription'

  const [errorMessage, setErrorMessage] = useState()
  const [loading, setLoading] = useState(false)
  const [promoCode, setPromoCode] = useState('')

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
      `${process.env.NEXT_PUBLIC_API}/api/payment/${
        mode === 'payment' ? 'create_external_payment_intent' : 'create_external_subscription'
      }`,
      'POST',
      session?.accessToken,
      {
        priceId: selectedPrice.price_component_id,
        ...(discountedAmount && { promoCode }),
      }
    )
    const clientSecret =
      mode === 'payment'
        ? response.payment_intent?.client_secret
        : response.subscription?.latest_invoice?.payment_intent?.client_secret

    // Confirm the Intent using the details collected by the Payment Element
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location}${mode === 'subscription' && 'subscriptions'}`, // direct to the exact purchase ID details
      },
      redirect: mode === 'subscription' ? 'always' : 'if_required',
    })

    if (error) {
      // This point is only reached if there's an immediate error when confirming the Intent.
      // Show the error to your customer (for example, "payment details incomplete").
      handleError(error)
    } else {
      setMode('paid')

      // Your customer is redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer is redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  }

  const resetPromo = () => {
    setDiscountedAmount(null)
    setPromoCode('')
  }

  return (
    <>
      {mode === 'subscription' && (
        <div className="flex-col mb-4 dark:text-gray-900" hidden={loading}>
          <label htmlFor="discount-code" className="text-sm">
            Promo Code
          </label>
          <div className="mt-1 flex space-x-4">
            {discountedAmount ? (
              <span className="inline-flex items-center rounded-full bg-green-100 py-0.5 pl-2.5 pr-1 text-sm font-medium text-green-700">
                {promoCode}
                <button
                  type="button"
                  className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:bg-gray-500 focus:text-white focus:outline-none"
                  onClick={resetPromo}
                >
                  <span className="sr-only">Remove discount code</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ) : (
              <>
                <input
                  type="text"
                  id="discount-code"
                  name="discount-code"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded-md bg-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                  disabled={loading}
                  onClick={() => onDiscountCode(promoCode, selectedPrice.price_component_id)}
                >
                  Apply
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div hidden={loading}>
          <PaymentElement />
        </div>
        {loading && (
          <div className="flex justify-center items-center">
            <Cog8ToothIcon className="animate-spin h-20 w-20" aria-hidden="true" />
          </div>
        )}
        <button
          type="submit"
          disabled={!stripe || loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white font-semibold bg-indigo-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            {loading ? (
              <Cog8ToothIcon
                className="animate-spin h-5 w-5 text-indigo-400 group-hover:text-indigo-300"
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
      {errorMessage && <div className="mt-2 font-bold text-red-800">{errorMessage}</div>}
    </>
  )
}

export default StripeCheckoutForm
