/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import Image from './Image'
import API from '@/lib/api'
import AuthorizeNetAccept from '@/components/payments/AuthorizeNetAccept'
import RegisterForm from './RegisterForm'
import DisclaimerMoR from '@/components/DisclaimerMoR'
import {
  socket,
  initiateSocket,
  disconnectSocket,
  subscribeToTransactions,
} from '@/lib/utils/socketUtils'
// import wallet from 'public/static/images/wallet.png'
//import defaultAvatar from '/static/media/userpic-default.png'
import { QRCodeSVG } from 'qrcode.react'

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
  const [toggle, setToggle] = useState(true)
  const [charge, setCharge] = useState({})

  const { keycloak } = useKeycloak()

  useEffect(() => {
    if (keycloak?.token) {
      // Initiate socket
      initiateSocket(keycloak?.token)
      // Start listening for new events
      subscribeToTransactions((err, status) => {
        if (err) return
        setStatus(status)
      })
    }
    return () => {
      disconnectSocket()
    }
  }, [keycloak?.token])

  const handleTip = async (amount) => {
    setStatus('unpaid')
    await keycloak.updateToken(300)
    const response = await fetchWithToken(
      `https://app.jetpeak.co/api/patron/tip/${props.username}`, // `http://localhost:5000/api/patron/btctip/${props.username}`,
      amount
    )
    if (response.data?.uri) {
      setCharge(response.data)
      setStatus('checkout')
    } else if (response.result) {
      setStatus('paid')
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
            {status === 'unpaid' ? (
              <div className="flex justify-center items-center flex-col">
                <h2 className="mb-2 dark:text-gray-900">
                  Creating checkout details for you to tip {props.username}...
                </h2>
              </div>
            ) : status === 'processing' ? (
              <div className="flex justify-center items-center flex-col">
                {/*<Spinner
								animation="border"
								variant="success"
								style={{ margin: '2rem', height: '100px', width: '100px', fontSize: '2.5rem' }}
								/>*/}
                <h2 className="mb-2 dark:text-gray-900">Sending your tip to {props.username}...</h2>
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
                <h2 className="m-4 text-xl">You sent a tip to {props.username}!</h2>
              </div>
            ) : status[0] === 'failure' ? (
              <ErrorComponent onBackButtonClick={() => setStatus('')} errors={status[1]} />
            ) : status === 'checkout' ? (
              <div className="flex justify-center items-center flex-col">
                <label
                  onClick={() => setToggle(!toggle)}
                  htmlFor="large-toggle"
                  className="inline-flex relative items-center cursor-pointer mb-3"
                >
                  <input
                    type="checkbox"
                    value=""
                    id="checked-toggle"
                    className="sr-only peer"
                    checked={toggle}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Lightning ⚡</span>
                </label>
                <div className="font-bold text-lg dark:text-gray-900">
                  {(charge.amount * 1e-8).toFixed(8)} BTC
                </div>
                <div className="dark:text-gray-900">
                  {' '}
                  ≈ ${charge.source_fiat_value.toFixed(2) + ' ' + charge.currency}
                </div>
                <div className="flex items-center justify-end p-4">
                  <a
                    href={
                      toggle
                        ? 'lightning:' + charge.lightning_invoice.payreq.toUpperCase()
                        : charge.uri.split('&lightning')[0]
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center border border-2 border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-lg hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                  >
                    <div className="mx-3">Open In {toggle && '⚡'} Wallet</div>
                  </a>
                </div>
                <QRCodeSVG
                  value={
                    toggle ? charge.uri.split('&lightning')[1] : charge.uri.split('&lightning')[0]
                  }
                  size={200}
                  bgColor={'#feffff'}
                  fgColor={'#000000'}
                  level={'L'}
                  includeMargin={true}
                />
                <div
                  className="cursor-pointer mt-4 flex justify-center items-center flex-col"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      toggle ? charge.lightning_invoice.payreq.toUpperCase() : charge.address
                    )
                  }}
                >
                  <div className="font-semibold text-md dark:text-gray-900">
                    {toggle ? 'Lightning Address:' : 'BTC Address:'}
                  </div>
                  <div className="text-sm dark:text-gray-900">
                    {toggle
                      ? charge.lightning_invoice.payreq.substr(0, 30).toUpperCase() + '...'
                      : charge.address}
                  </div>
                </div>
              </div>
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
                    min="1"
                    step="any"
                    max="200"
                    placeholder="50.00"
                    className="shadow appearance-none border w-40 rounded py-2 px-3 text-indigo-800 leading-tight focus:outline-none focus:shadow-outline"
                    onChange={(e) => setTipAmount(parseFloat(e.target.value))}
                  />
                  <span className="text-xl ml-3">USD</span>
                </div>
                <div className="flex items-center justify-end pt-6 mt-4">
                  <button
                    className="flex items-center justify-center border border-2 border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-lg hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                    type="submit"
                  >
                    <div className="mx-3">Checkout</div>
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
