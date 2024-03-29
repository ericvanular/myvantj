import { useState, useEffect, useContext } from 'react'
import API from '@/lib/api'
//import { LockClosedIcon } from '@heroicons/react/solid'
// import { useKeycloak } from '@react-keycloak-fork/ssr'
import { useSession, signIn, signOut } from 'next-auth/react'
import { SiteContext } from 'pages/_app'

const ErrorComponent = (props) => (
  <div className="flex flex-col justify-center items-center">
    <div className="text-black px-6 py-3 border-2 border-black border-solid rounded relative mb-4 bg-red-300">
      <span className="text-xl inline-block mr-5 align-middle">
        <i className="fas fa-bell" />
      </span>
      <span className="inline-block text-xl align-middle mr-8">Registration Failed</span>
    </div>
    {props.errors && (
      <div className="text-md text-bold">
        <b>{props.errors}</b>
      </div>
    )}
    <div className="flex items-center justify-end pt-6">
      <button
        className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
        onClick={props.onBackButtonClick}
      >
        <div className="mx-3">Try Again</div>
      </button>
    </div>
  </div>
)

export default function RegisterForm({ signUpSubtext }) {
  // const { keycloak } = useKeycloak()
  const { data: session, status } = useSession()
  const [redirect, setRedirect] = useState(false)
  const [mode, setMode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { partyData } = useContext(SiteContext)

  const registerAccount = async () => {
    setMode('processing')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/auth/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        parentOrgId: partyData?.id,
        registrationType: 'Registree',
      }),
    })
    const data = await response.json()
    if (data.error) {
      setMode(['failure', data.error])
      return
    } else {
      setMode('success')
      setTimeout(() => signIn('keycloak'), 2000)
    }
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {partyData?.avatar_url ? (
            <img
              className="mx-auto w-auto object-cover object-center"
              src={partyData.avatar_url}
              alt={partyData.avatar_url}
            />
          ) : (
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
              alt="Workflow"
            />
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {signUpSubtext}
            {/*
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                start your 14-day free trial
              </a>
              */}
          </p>
        </div>

        {mode === 'processing' ? (
          <div className="flexcenter flexcol">
            {/*<Spinner
										animation="border"
										variant="success"
										style={{ margin: '2rem', height: '100px', width: '100px', fontSize: '2.5rem' }}
										/>*/}
            <h2 style={{ marginBottom: '2rem' }}>Registering your new account...</h2>
          </div>
        ) : mode === 'success' ? (
          <div className="flexcenter flexcol">
            {/*<img src={followed} alt="" height="100" style={{ margin: '2rem' }} />*/}
            <h2 style={{ marginBottom: '2rem' }}>
              Nice, you signed up! Sending you to sign in to your new account.{' '}
            </h2>
          </div>
        ) : mode[0] === 'failure' ? (
          <ErrorComponent onBackButtonClick={() => setMode('')} errors={mode[1]} />
        ) : (
          <form className="mt-8 space-y-6" onSubmit={registerAccount}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/*
								<div className="flex items-center">
									<input
										id="remember-me"
										name="remember-me"
										type="checkbox"
										className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
									/>
									<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
										Remember me
									</label>
								</div>
							*/}

              <div className="text-sm">
                <button
                  className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                  onClick={() => signIn('keycloak')}
                >
                  Have an account? Login
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white font-semibold bg-indigo-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {/*<LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />*/}
                </span>
                Register
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
