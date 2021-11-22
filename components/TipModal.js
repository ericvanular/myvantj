import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import API from '@/lib/api'
import AuthorizeNetAccept from '@/components/payments/AuthorizeNetAccept'
import RegisterForm from './RegisterForm'
import DisclaimerMoR from '@/components/DisclaimerMoR'
//import followed from '/static/media/followed.png'
//import defaultAvatar from '/static/media/userpic-default.png'

import { useKeycloak } from '@react-keycloak/ssr'

const ErrorComponent = (props) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-black px-6 py-3 border-2 border-black border-solid rounded relative mb-4 bg-red-300">
      <span className="text-xl inline-block mr-5 align-middle">
        <i className="fas fa-bell" />
      </span>
      <span className="inline-block text-xl align-middle mr-8">Tip failed to send.</span>
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

export default function TipModal(props) {
  const [redirect, setRedirect] = useState(false)
  const [status, setStatus] = useState('')
  const [tipAmount, setTipAmount] = useState(0)

  const { keycloak } = useKeycloak()

  const handleTip = async (amount) => {
    setStatus('processing')
    await keycloak.updateToken(300)
    const response = await fetchWithToken(
      `https://app.jetpeak.co/app/api/patron/tip/${props.username}`,
      amount
    )
    if (response.result) {
      setStatus('success')
      setTimeout(() => {
        props.setOpen(false)
        setStatus('')
        setTipAmount(0)
      }, 10000)
    } else {
      console.log(response)
      setStatus(['failure', response.error])
    }
  }

  const fetchWithToken = async (url, amount) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${keycloak?.token}`,
      },
      body: JSON.stringify({ amount: amount }),
    })
    return res.json()
  }

  const resetModalStatus = () => {
    props.setOpen(false)
    setStatus('')
    setTipAmount(0)
  }

  return (
    <Modal open={props.open} setOpen={props.setOpen}>
      {keycloak?.authenticated ? (
        <>
          {/*header*/}
          <div className="flex items-center justify-between p-4 border-b border-solid border-blueGray-200 rounded-t">
            <h2 className="text-3xl text-black font-semibold">Tip {props.username}?</h2>
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
            {status === 'processing' ? (
              <div className="flexcenter flexcol">
                {/*<Spinner
								animation="border"
								variant="success"
								style={{ margin: '2rem', height: '100px', width: '100px', fontSize: '2.5rem' }}
								/>*/}
                <h2 className="mb-2">Sending your tip to {props.username}...</h2>
              </div>
            ) : status === 'success' ? (
              <div className="flex justify-center items-center flex-col">
                {/*<img src={followed} alt="" height="100" style={{ margin: '2rem' }} />*/}
                <h2 className="mb-2">You sent a tip to {props.username}!</h2>
              </div>
            ) : status[0] === 'failure' ? (
              <ErrorComponent onBackButtonClick={() => setStatus('')} errors={status[1]} />
            ) : props.paymentMethods?.length ? (
              <form
                className="flex flex-col justify-center items-center"
                onSubmit={(e) => handleTip(tipAmount)}
              >
                <label
                  className="block text-indigo-900 text-lg font-semibold mb-4"
                  htmlFor="username"
                >
                  How much would you like to tip?
                </label>
                <div className="flex justify-center items-center">
                  <span className="font-semibold text-2xl mr-3">$</span>
                  <input
                    value={tipAmount}
                    type="number"
                    name="amount"
                    min="5"
                    step="any"
                    max="200"
                    placeholder="50.00"
                    className="shadow appearance-none border w-40 rounded py-2 px-3 text-indigo-800 leading-tight focus:outline-none focus:shadow-outline"
                    onChange={(e) => setTipAmount(parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-end pt-6 mt-4">
                  <button
                    className="flex items-center justify-center border border-2 border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-lg hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                    type="submit"
                  >
                    <div className="mx-3">Send Tip</div>
                  </button>
                </div>
              </form>
            ) : (
              <AuthorizeNetAccept getPaymentMethods={props.getPaymentMethods} />
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
