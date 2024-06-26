import React, { useState, useCallback, useContext } from 'react'
import Modal from '../Modal'
import API from '@/lib/api'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import { SiteContext } from 'pages/_app'
import { useSWRConfig } from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'
import RegisterForm from '../RegisterForm'
import CheckoutBTC from '../CheckoutBTC'
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/utils/stripe-client'
import Image from '../Image'
import {
  socket,
  initiateSocket,
  disconnectSocket,
  subscribeToTransactions,
} from '@/lib/utils/socketUtils'
import StripeCheckoutForm from './StripeCheckoutForm'

const ErrorComponent = ({ errors, onBackButtonClick }) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-black px-6 py-3 border-2 border-black border-solid rounded relative mb-4 bg-red-300">
      <span className="text-xl inline-block mr-5 align-middle">
        <i className="fas fa-bell" />
      </span>
      <span className="inline-block text-xl align-middle mr-8">Subscription Failed.</span>
    </div>
    {errors && (
      <div className="text-md text-bold">
        <b>Failure Cause: </b>
        {errors}
      </div>
    )}
    <div className="flex items-center justify-end pt-6 mt-4">
      <button
        className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
        onClick={onBackButtonClick}
      >
        <div className="mx-3">Try Again</div>
      </button>
    </div>
  </div>
)

const PauseComponent = ({ agreementItemId, handlePause }) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-sm">
      Your current subscription will be paused and no further payments will be taken unless you
      unpause the subscription.
    </div>
    <div className="flex items-center justify-end pt-6 mt-4">
      <button
        className="flex items-center justify-center border-solid w-full rounded-full bg-yellow-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-yellow-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
        onClick={() => handlePause(agreementItemId)}
      >
        <div className="mx-3">Pause Subscription</div>
      </button>
    </div>
  </div>
)

const CancelComponent = ({ agreementItemId, handleCancel }) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-sm">
      No further payments will be taken at the end of the current billing period. Your access will
      remain valid for the duration of time you have already paid for.
    </div>
    <div className="flex items-center justify-end pt-6 mt-4">
      <button
        className="flex items-center justify-center border-solid w-full rounded-full bg-red-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-red-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
        onClick={() => handleCancel(agreementItemId)}
      >
        <div className="mx-3">Cancel Subscription</div>
      </button>
    </div>
  </div>
)

const AlreadyFollowing = ({ creator }) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-lg text-center text-black px-6 py-3 border-2 border-black border-solid rounded relative mb-4 bg-green-300">
      You're already following {creator.name}!
    </div>
    {/* <div className="text-md text-bold">
      <b>Your subscription expires on: </b>
      {'Date'}
    </div>
    <div className="flex items-center justify-end pt-6 mt-4">
      <button
        className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
        onClick={props.onBackButtonClick}
      >
        <div className="mx-3">Extend Subscription</div>
      </button>
    </div> */}
  </div>
)

export default function StripePaymentsModal({ open, setOpen, selectedPrice }) {
  const [mode, setMode] = useState('checkoutStripe')
  const [plan, setPlan] = useState({})
  const [charge, setCharge] = useState({})

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

  const handleDiscountCode = useCallback(async (code) => {
    // On the server, validate that the discount code is valid and return the new amount
    const { newAmount } = await fetch('/apply-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    // Trigger a state change that re-renders the Elements provider with the new amount
    setDiscountedAmount(newAmount)
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

  // useEffect(() => {
  //   if (name) {
  //     getPlans()
  //   }
  // }, [name])

  // const getPlans = async () => {
  //   const planData = await API(`${process.env.NEXT_PUBLIC_API}/api/creator/plans/${name}`)
  //   planData?.plans && setPlan(planData.plans.filter((plan) => plan.name === 'Paid')[0])
  // }

  const handleFollowCheckout = async () => {
    setMode('unpaid')
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API}/api/patron/btcfollow/${name}`,
      'POST',
      session?.accessToken
    )
    if (response.data?.uri) {
      setCharge(response.data)
      setMode('checkout')
    } else {
      console.log(response)
      setMode(['failure', response.error])
    }
  }

  // const handlePause = async (agreementItemId) => {
  //   // setMode('processing')
  //   const response = await fetchWithToken(
  //     `${process.env.NEXT_PUBLIC_API}/api/subscription/pause_subscription`,
  //     'POST',
  //     session?.accessToken,
  //     { agreementItemId }
  //   )
  //   if (response.id) {
  //     setMode('paused')
  //     mutate(
  //       `${process.env.NEXT_PUBLIC_API}/api/company/public_products/${
  //         host.split('.')[0]
  //       }?page=${pageIndex}`
  //     )
  //     setTimeout(() => resetModalStatus(), 2000)
  //     // setCharge(response.data)
  //   } else {
  //     console.log(response)
  //     setMode(['failure', response.error])
  //   }
  // }

  const handleCancel = async (agreementItemId) => {
    // setMode('processing')
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API}/api/subscription/cancel_subscription`,
      'POST',
      session?.accessToken,
      { agreementItemId }
    )
    if (response.id) {
      setMode('canceled')
      mutate()
      setTimeout(() => resetModalStatus(), 2000)
      // setCharge(response.data)
    } else {
      console.log(response)
      setMode(['failure', response.error])
    }
  }

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

  const priceString = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // price.currency,
    minimumFractionDigits: 0,
  }).format(selectedPrice?.price_component_price)

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
            {partyData?.creator?.following ? (
              <AlreadyFollowing creator={partyData.creator} />
            ) : mode === 'unpaid' ? (
              <div className="flex justify-center items-center flex-col">
                <h2 className="mb-2 dark:text-gray-900">
                  Creating checkout details for you to follow {name}...
                </h2>
              </div>
            ) : mode === 'canceled' ? (
              <div className="flex justify-center items-center flex-col">
                <h2 className="mb-2 dark:text-gray-900">
                  You successfully canceled your subscription with {name}.
                </h2>
              </div>
            ) : mode === 'paused' ? (
              <div className="flex justify-center items-center flex-col">
                <h2 className="mb-2 dark:text-gray-900">
                  You successfully paused your subscription with {name}.
                </h2>
              </div>
            ) : mode === 'processing' ? (
              <div className="flex justify-center items-center flex-col">
                {/*<Spinner
              animation="border"
              variant="success"
              style={{ margin: '2rem', height: '100px', width: '100px', fontSize: '2.5rem' }}
              />*/}
                <h2 className="mb-2 dark:text-gray-900">Loading...</h2>
              </div>
            ) : mode === 'paid' ? (
              <div className="flex justify-center items-center flex-col">
                <h2 className="m-4 text-xl">Your payment was made successfully! Thank you</h2>
              </div>
            ) : mode[0] === 'failure' ? (
              <ErrorComponent
                onBackButtonClick={() => setMode('stripeCheckout')}
                errors={mode[1]}
              />
            ) : // ) : mode === 'cancel' ? (
            //   <CancelComponent
            //     agreementItemId={agreementItemId}
            //     handleCancel={handleCancel}
            //     onBackButtonClick={() => setMode('')}
            //   />
            // ) : mode === 'pause' ? (
            //   <PauseComponent
            //     agreementItemId={agreementItemId}
            //     handlePause={handlePause}
            //     onBackButtonClick={() => setMode('')}
            //   />
            // )
            mode === 'checkoutBTC' ? (
              <CheckoutBTC charge={charge} />
            ) : mode === 'checkoutStripe' ? (
              <>
                <div className="mb-6 dark:text-gray-900">
                  <div>
                    <b>Product: </b>
                    {selectedPrice?.product?.name}
                  </div>
                  <div>
                    <b>Amount: </b>
                    {priceString}
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
                    onDiscountCode={handleDiscountCode}
                  />
                </Elements>
              </>
            ) : plan ? (
              // paymentMethods?.length ? (
              <>
                <div className="rounded overflow-hidden shadow-lg">
                  {/* <img
                    className="w-full max-h-36 object-cover object-center"
                    src={banner_url}
                    alt="Banner"
                  /> */}
                  <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">Subscription Benefits</div>
                    <p className="text-md text-gray-600 flex items-center my-3">
                      <svg
                        className="fill-current text-gray-500 w-5 h-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z" />
                      </svg>
                      Full access to {name}'s premium content
                    </p>
                    <p className="text-md text-gray-600 flex items-center mb-3">
                      <svg
                        className="fill-current text-gray-500 w-5 h-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z" />
                      </svg>
                      Direct message with {name}
                    </p>
                    <p className="text-md text-gray-600 flex items-center">
                      <svg
                        className="fill-current text-gray-500 w-5 h-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z" />
                      </svg>
                      Cancel your subscription at any time
                    </p>
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                    onClick={() => handleFollowCheckout()}
                  >
                    <div className="mx-3">
                      Follow {name} for ${plan.amount} / month
                    </div>
                  </button>
                </div>
                {/* <DisclaimerMoR creator={name} color="gray" /> */}
              </>
            ) : (
              // ) : (
              //   <AuthorizeNetAccept getPaymentMethods={getPaymentMethods} />
              // )
              <div className="tip-label text-black">
                {name} has no paid subscription plans yet! Check out their public posts for now.
              </div>
            )}
          </div>
        </>
      ) : (
        <RegisterForm signUpSubtext={`To get started with  ${name}!`} partyData={partyData} />
      )}
    </Modal>
  )
}
