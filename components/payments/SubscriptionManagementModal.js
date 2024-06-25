import React, { useState, useEffect, useContext } from 'react'
import Modal from '../Modal'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import { SiteContext } from 'pages/_app'
import { useSWRConfig } from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'

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

const PauseComponent = ({ agreementId, handlePause }) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-sm dark:text-gray-900">
      Your current subscription will be paused and no further payments will be taken unless you
      unpause the subscription.
    </div>
    <div className="flex items-center justify-end pt-6 mt-4">
      <button
        className="flex items-center justify-center border-solid w-full rounded-full bg-yellow-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-yellow-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
        onClick={() => handlePause(agreementId)}
      >
        <div className="mx-3">Pause Subscription</div>
      </button>
    </div>
  </div>
)

const CancelComponent = ({ agreementId, handleCancel }) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-sm dark:text-gray-900">
      No further payments will be taken at the end of the current billing period. Your access will
      remain valid for the duration of time you have already paid for.
    </div>
    <div className="flex items-center justify-end pt-6 mt-4">
      <button
        className="flex items-center justify-center border-solid w-full rounded-full bg-red-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-red-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
        onClick={() => handleCancel(agreementId)}
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

export default function SubscriptionManagementModal({ open, setOpen, mode, setMode, agreementId }) {
  const { data: session, status } = useSession()
  const { partyData } = useContext(SiteContext)
  const { mutate } = useSWRConfig()

  const handlePause = async (agreementId) => {
    // setMode('processing')
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API}/api/subscription/pause_subscription`,
      'POST',
      session?.accessToken,
      { agreementId }
    )
    if (response.id) {
      setMode('paused')
      // mutate(
      //   `${process.env.NEXT_PUBLIC_API}/api/company/public_products/${
      //     host.split('.')[0]
      //   }?page=${pageIndex}`
      // )
      mutate()
      setTimeout(() => resetModalStatus(), 2000)
      // setCharge(response.data)
    } else {
      console.log(response)
      setMode(['failure', response.error])
    }
  }

  const handleCancel = async (agreementId) => {
    // setMode('processing')
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API}/api/subscription/cancel_subscription`,
      'POST',
      session?.accessToken,
      { agreementId }
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
    setMode('')
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
      default:
        return `Manage Subscription`
    }
  }

  return (
    <Modal open={open} setOpen={setOpen}>
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
        {mode === 'canceled' ? (
          <div className="flex justify-center items-center flex-col">
            <h2 className="mb-2 dark:text-gray-900">
              You successfully canceled your subscription.
            </h2>
          </div>
        ) : mode === 'paused' ? (
          <div className="flex justify-center items-center flex-col">
            <h2 className="mb-2 dark:text-gray-900">You successfully paused your subscription.</h2>
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
            <h2 className="m-4 text-xl">
              Payment successful! Sending you to the subscriptions page...
            </h2>
          </div>
        ) : mode[0] === 'failure' ? (
          <ErrorComponent onBackButtonClick={() => setMode('')} errors={mode[1]} />
        ) : mode === 'cancel' ? (
          <CancelComponent
            agreementId={agreementId}
            handleCancel={handleCancel}
            onBackButtonClick={() => setMode('')}
          />
        ) : (
          mode === 'pause' && (
            <PauseComponent
              agreementId={agreementId}
              handlePause={handlePause}
              onBackButtonClick={() => setMode('')}
            />
          )
        )}
      </div>
    </Modal>
  )
}
