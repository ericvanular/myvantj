import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function CheckoutBTC({ charge }) {
  const [toggle, setToggle] = useState(true)

  return (
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
        value={toggle ? charge.uri.split('&lightning')[1] : charge.uri.split('&lightning')[0]}
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
  )
}
