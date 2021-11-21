import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import API from '@/lib/api'
import AuthorizeNetAccept from '@/components/payments/AuthorizeNetAccept'
import DisclaimerMoR from '@/components/DisclaimerMoR'
import RegisterForm from './RegisterForm'
import axios from 'axios'
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

export default function FollowModal(props) {
  const [redirect, setRedirect] = useState(false)
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState({})

  const { keycloak } = useKeycloak()

  useEffect(() => {
    if (props.username) {
      getPlans()
    }
  }, [props.username])

  const getPlans = async () => {
    const planData = await API(`https://app.jetpeak.co/app/api/creator/plans/${props.username}`)
    planData?.plans && setPlan(planData.plans.filter((plan) => plan.name === 'Paid')[0])
  }

  const handleFollow = async () => {
    setStatus('processing')
    await keycloak.updateToken(300)
    const response = await fetchWithToken(
      `https://app.jetpeak.co/app/api/patron/follow/${props.username}`
    )
    if (response.result) {
      setStatus('success')
      props.getPosts(1)
      props.getCreator()
      setTimeout(() => {
        props.setOpen(false)
        setStatus('')
      }, 10000)
    } else {
      console.log(response)
      setStatus(['failure', response.error])
    }
  }

  const fetchWithToken = async (url) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${keycloak?.token}`,
      },
    })
    return res.json()
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
            <h2 className="text-3xl font-semibold">Follow {props.username}?</h2>
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
                <h2 style={{ marginBottom: '2rem' }}>Following {props.username}...</h2>
              </div>
            ) : status === 'success' ? (
              <div className="flexcenter flexcol">
                {/*<img src={followed} alt="" height="100" style={{ margin: '2rem' }} />*/}
                <h2 style={{ marginBottom: '2rem' }}>You followed {props.username}!</h2>
              </div>
            ) : status[0] === 'failure' ? (
              <ErrorComponent onBackButtonClick={() => setStatus('')} errors={status[1]} />
            ) : plan ? (
              props.paymentMethods?.length ? (
                <>
                  <div className="rounded overflow-hidden shadow-lg">
                    <img
                      className="w-full max-h-36 object-cover object-center"
                      src={
                        props.banner_url ||
                        'https://f000.backblazeb2.com/file/jetpeak/ef480b01-fac6-4137-bfac-f47e73df1f8b/9919f630fcb74c5492a48af734cca30f.jpg'
                      }
                      alt="Banner"
                    />
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
                        Full access to {props.username}'s Premium Content
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
                      onClick={() => handleFollow()}
                    >
                      <div className="mx-3">
                        Follow {props.username} for ${plan.amount} / month
                      </div>
                    </button>
                  </div>
                  <DisclaimerMoR creator={props.username} color="gray" />
                </>
              ) : (
                <AuthorizeNetAccept getPaymentMethods={props.getPaymentMethods} />
              )
            ) : (
              <div className="tip-label">
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
