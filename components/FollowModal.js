import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import API from '@/lib/api'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import generateFileUrl from '@/lib/utils/generateFileUrl'
import AuthorizeNetAccept from '@/components/payments/AuthorizeNetAccept'
import DisclaimerMoR from '@/components/DisclaimerMoR'
import Image from './Image'
import CheckoutBTC from './CheckoutBTC'
import RegisterForm from './RegisterForm'
import {
  socket,
  initiateSocket,
  disconnectSocket,
  subscribeToTransactions,
} from '@/lib/utils/socketUtils'
//import followed from '/static/media/followed.png'
//import defaultAvatar from '/static/media/userpic-default.png'

import { useKeycloak } from '@react-keycloak/ssr'

const ErrorComponent = (props) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-black px-6 py-3 border-2 border-black border-solid rounded relative mb-4 bg-red-300">
      <span className="text-xl inline-block mr-5 align-middle">
        <i className="fas fa-bell" />
      </span>
      <span className="inline-block text-xl align-middle mr-8">Subscription failed.</span>
    </div>
    {props.errors && (
      <div className="text-md text-bold">
        <b>Failure Cause: </b>
        {props.errors}
      </div>
    )}
    <div className="flex items-center justify-end pt-6 mt-4">
      <button
        className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
        onClick={props.onBackButtonClick}
      >
        <div className="mx-3">Try Again</div>
      </button>
    </div>
  </div>
)

const AlreadyFollowing = (props) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-lg text-center text-black px-6 py-3 border-2 border-black border-solid rounded relative mb-4 bg-green-300">
      You're already following {props.creator.username}!
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

export default function FollowModal(props) {
  const [redirect, setRedirect] = useState(false)
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState({})
  const [charge, setCharge] = useState({})

  const { keycloak } = useKeycloak()

  useEffect(() => {
    if (keycloak?.token) {
      // Initiate socket
      initiateSocket(keycloak?.token)
      // Start listening for new events
      subscribeToTransactions((err, emittedStatus) => {
        if (err) return
        setStatus(emittedStatus)
        setTimeout(() => {
          props.setOpen(false)
          setStatus('')
        }, 5000)
      })
    }
    return () => {
      disconnectSocket()
    }
  }, [keycloak?.token])

  useEffect(() => {
    if (props.username) {
      getPlans()
    }
  }, [props.username])

  const getPlans = async () => {
    const planData = await API(`${process.env.NEXT_PUBLIC_API}/api/creator/plans/${props.username}`)
    planData?.plans && setPlan(planData.plans.filter((plan) => plan.name === 'Paid')[0])
  }

  const handleFollowCheckout = async () => {
    setStatus('unpaid')
    await keycloak.updateToken(300)
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API}/api/patron/btcfollow/${props.username}`,
      'POST',
      keycloak?.token
    )
    if (response.data?.uri) {
      setCharge(response.data)
      setStatus('checkout')
    } else {
      console.log(response)
      setStatus(['failure', response.error])
    }
  }

  const resetModalStatus = () => {
    props.setOpen(false)
    setStatus('')
  }

  return (
    <Modal open={props.open} setOpen={props.setOpen}>
      {keycloak?.authenticated ? (
        <>
          {/*header*/}
          <div className="flex items-center justify-between p-4 border-b border-solid border-blueGray-200 rounded-t">
            <h2 className="text-3xl text-black font-semibold">Follow {props.username}?</h2>
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
            {props.creatorData?.creator.following ? (
              <AlreadyFollowing creator={props.creatorData.creator} />
            ) : status === 'unpaid' ? (
              <div className="flex justify-center items-center flex-col">
                <h2 className="mb-2 dark:text-gray-900">
                  Creating checkout details for you to follow {props.username}...
                </h2>
              </div>
            ) : status === 'processing' ? (
              <div className="flex justify-center items-center flex-col">
                {/*<Spinner
              animation="border"
              variant="success"
              style={{ margin: '2rem', height: '100px', width: '100px', fontSize: '2.5rem' }}
              />*/}
                <h2 className="mb-2 dark:text-gray-900">Following {props.username}...</h2>
              </div>
            ) : status === 'paid' ? (
              <div className="flex justify-center items-center flex-col">
                <Image
                  src={'/static/images/wallet.png'}
                  width="100px"
                  height="100px"
                  alt="wallet"
                  className="p-3"
                />
                <h2 className="m-4 text-xl">You followed {props.username}!</h2>
              </div>
            ) : status[0] === 'failure' ? (
              <ErrorComponent onBackButtonClick={() => setStatus('')} errors={status[1]} />
            ) : status === 'checkout' ? (
              <CheckoutBTC charge={charge} />
            ) : plan ? (
              // props.paymentMethods?.length ? (
              <>
                <div className="rounded overflow-hidden shadow-lg">
                  {props.banner_url && (
                    <img
                      className="w-full max-h-36 object-cover object-center"
                      src={props.banner_url}
                      alt="Banner"
                    />
                  )}
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
                      Full access to {props.username}'s premium content
                    </p>
                    <p className="text-md text-gray-600 flex items-center mb-3">
                      <svg
                        className="fill-current text-gray-500 w-5 h-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z" />
                      </svg>
                      Direct message with {props.username}
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
                      Follow {props.username} for ${plan.amount} / month
                    </div>
                  </button>
                </div>
                {/* <DisclaimerMoR creator={props.username} color="gray" /> */}
              </>
            ) : (
              // ) : (
              //   <AuthorizeNetAccept getPaymentMethods={props.getPaymentMethods} />
              // )
              <div className="tip-label text-black">
                {props.username} has no paid subscription plans yet! Check out their public posts
                for now.
              </div>
            )}
          </div>
        </>
      ) : (
        <RegisterForm
          signUpSubtext={`To see ${props.username}'s posts, chat with them, and more`}
        />
      )}
    </Modal>
  )
}
