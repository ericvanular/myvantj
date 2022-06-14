import React, { useState, useEffect } from 'react'
import Crypto101 from './Crypto101'
import { QRCodeSVG } from 'qrcode.react'

export default function CheckoutBTC({ username, charge }) {
  const [toggle, setToggle] = useState(true)
  const [help, setHelp] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(toggle ? charge.lightning_invoice.payreq.toUpperCase() : charge.address)
      .then(
        () => {
          setCopied(true)
          // changing back to default state after 1.5 seconds.
          setTimeout(() => {
            setCopied(false)
          }, 1500)
        },
        (err) => {
          console.log('failed to copy', err.mesage)
        }
      )
  }

  return (
    <div className="flex justify-center items-center flex-col">
      {help ? (
        <Crypto101 username={username} setHelp={setHelp} />
      ) : (
        <>
          <div className="text-lg font-bold dark:text-gray-900">{username} accepts Bitcoin</div>
          <div className="flex items-center justify-end mt-2 mb-4">
            <button
              className="flex items-center justify-center border-solid w-full rounded-md bg-red-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-sm border border-2 hover:bg-green-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
              onClick={() => setHelp(true)}
            >
              <div className="">Don't have Bitcoin?</div>
            </button>
          </div>
          <label
            onClick={() => setToggle(!toggle)}
            htmlFor="large-toggle"
            className="inline-flex relative items-center cursor-pointer m-3"
          >
            <input
              type="checkbox"
              value={toggle}
              id="checked-toggle"
              onChange={() => setToggle(!toggle)}
              className="sr-only peer"
              checked={toggle}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">Lightning ⚡</span>
          </label>
          <div className="font-semibold text-md dark:text-gray-900">
            {(charge.amount * 1e-8).toFixed(8)} BTC
          </div>
          <div className="dark:text-gray-900">
            {' '}
            ≈ ${charge.source_fiat_value.toFixed(2) + ' ' + charge.currency}
          </div>
          <QRCodeSVG
            value={toggle ? charge.uri.split('&lightning')[1] : charge.uri.split('&lightning')[0]}
            size={200}
            bgColor={'#feffff'}
            fgColor={'#000000'}
            level={'L'}
            includeMargin={true}
          />
          {/* <div className="flex items-center justify-end m-2">
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
          </div> */}
          <div
            className="cursor-pointer m-2 flex justify-center items-center flex-col"
            onClick={copyToClipboard}
          >
            <div className="font-semibold text-md dark:text-gray-900 mb-1">
              {toggle ? '⚡ Address:' : 'BTC Address:'}
            </div>
            <button
              className={`text-sm border w-36 border-gray-500 rounded p-2 transition dark:text-gray-900 ${
                copied && 'bg-green-500 text-white dark:text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            {/* <div className="text-sm dark:text-gray-900">
              {toggle
                ? charge.lightning_invoice.payreq.substr(0, 30).toUpperCase() + '...'
                : charge.address}
            </div> */}
          </div>
        </>
      )}
    </div>
  )
}
