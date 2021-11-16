import React, { useState, useEffect } from 'react'
import AuthorizeNetFormContainer from './AuthorizeNetFormContainer'
import PaymentMethodDisplay from './PaymentMethodDisplay'
import API from '@/lib/api'

let clientKey = '829s9qFsUr2uf5mrCKLSNKu27tvdvr7v7rW69uB73KEmfPQeZjW6WK6zczJV2QKj'
let apiLoginId = '8d6Lw66vCm4'

const ErrorComponent = (props) => (
  <>
    <div className="bg-transparent text-center pb-4 lg:px-4">
      <div
        className="p-2 bg-red-700 items-center text-white leading-none rounded-full flex inline-flex"
        role="alert"
      >
        <span className="flex rounded-full bg-red-500 uppercase px-2 py-1 text-xs font-bold mr-3">
          Error
        </span>
        <span className="font-semibold mr-2 text-left flex-auto">Failed to add payment card</span>
      </div>
    </div>
    {props.errors.map((error) => (
      <div className="flex justify-center leading-relaxed text-lg">
        <b className="mr-2">→</b>
        {error}
      </div>
    ))}
    <button
      className="flex items-center justify-center border border-2 border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-4 py-2 text-md hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mt-6 ease-linear transition-all duration-150"
      onClick={props.onBackButtonClick}
    >
      Try Again
    </button>
  </>
)

export default function AuthorizeNetAccept(props) {
  const [status, setStatus] = useState('')

  const onErrorHandler = (response) => {
    setStatus(['failure', response.messages.message.map((err) => err.text)])
  }

  const onSuccessHandler = async (response) => {
    // Process API response on your backend...
    setStatus('processing')
    await addPaymentMethod(response)
    setStatus('')
  }

  const addPaymentMethod = async (response) => {
    const options = {
      method: 'post',
      url: '/api/subscription/payment_method',
      data: {
        dataDescriptor: response.opaqueData.dataDescriptor,
        dataValue: response.opaqueData.dataValue,
      },
    }
    await API(options).then((data) => props.getPaymentMethods())
    return
  }

  return (
    <div>
      {status === 'processing' ? (
        <div className="flexcenter flexrow" style={{ margin: '2rem' }}>
          {/*<Spinner animation="border" style={{ margin: '1rem' }} />*/}
          <h4>Saving Your Card</h4>
        </div>
      ) : status[0] === 'failure' ? (
        <ErrorComponent onBackButtonClick={() => setStatus('')} errors={status[1]} />
      ) : (
        <>
          <div className="bg-transparent text-center pb-4 lg:px-4">
            <div
              className="p-2 bg-indigo-700 items-center text-white leading-none rounded-full flex inline-flex"
              role="alert"
            >
              <span className="flex rounded-full bg-indigo-500 uppercase px-2 py-1 text-xs font-bold mr-3">
                ⚡
              </span>
              <span className="font-semibold mr-2 text-left flex-auto">Add a payment method</span>
            </div>
          </div>
          <AuthorizeNetFormContainer
            environment="sandbox"
            onError={onErrorHandler}
            onSuccess={onSuccessHandler}
            amount={23}
            component={PaymentMethodDisplay}
            clientKey={clientKey}
            apiLoginId={apiLoginId}
          />
        </>
      )}
    </div>
  )
}
