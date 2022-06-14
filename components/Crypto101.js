import React, { useState, useEffect } from 'react'
import Image from './Image'

const Crypto101 = (props) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="text-black px-6 py-3 border-2 border-black border-solid rounded relative mb-4 bg-pink-100 text-xl inline-block align-middle font-bold">
        Don't have any Bitcoin? &darr;
      </div>
      <div className="text-md text-bold underline dark:text-gray-900">
        Follow these steps to get some ₿
      </div>
      <ol className="text-sm list-decimal m-4 dark:text-gray-900">
        <li className="my-1">
          Choose a reputable crypto exchange like Kraken, BlockFi, CoinBase, or Crypto.com
        </li>
        <li className="my-1">Create & verify your exchange account</li>
        <li className="my-1">Deposit cash</li>
        <li className="my-1">Buy some Bitcoin</li>
        <li className="my-1">
          Use the exchange's wallet to{' '}
          <span
            className="cursor-pointer text-blue-600 hover:text-black"
            onClick={() => props.setHelp(false)}
          >
            scan this QR code
          </span>{' '}
          & hit send!
        </li>
      </ol>
      <div className="flex items-center justify-end mt-4">
        <button
          className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
          onClick={() => props.setHelp(false)}
        >
          <div className="mx-3">Back to checkout</div>
        </button>
      </div>
    </div>
  )
}

export default Crypto101
