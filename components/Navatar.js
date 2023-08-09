import { useEffect, useState, Fragment } from 'react'
// import { headers } from 'next/headers'
import Image from './Image'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import useSWR from 'swr'
import fetchWithToken from '@/lib/utils/fetchWithToken'

import { useSession, signIn, signOut, getSession } from 'next-auth/react'

const logOutKeycloak = async () => {
  const response = await fetch('/api/auth/logOutKeycloak', {
    method: 'GET',
    // headers: headers()
  })
  const responseJson = await response.json()
  await signOut({ redirect: false })
  window.location.href = responseJson.path
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Navatar = (props) => {
  const { data: session, status } = useSession()
  const authenticated = status === 'authenticated'

  const { data: userData, error: userError } = useSWR(
    session?.user?.name
      ? [
          `${process.env.NEXT_PUBLIC_API}/api/creator/${session?.user?.name}`,
          'GET',
          session?.accessToken,
        ]
      : null,
    ([url, method, token]) => fetchWithToken(url, method, token)
  )

  return (
    <Menu as="div" className="ml-3 relative">
      <div>
        <Menu.Button className="bg-white flex text-sm rounded-full ring-1 hover:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white">
          <span className="sr-only">Open User Menu</span>
          {authenticated ? (
            userData?.creator?.avatar_url ? (
              <img
                className="h-12 w-12 rounded-full object-cover object-center"
                src={userData?.creator.avatar_url}
                alt={userData?.creator.username}
              />
            ) : (
              <div className="h-12 w-12 text-xl bg-indigo-800 text-white rounded-full font-semibold flex items-center justify-center">
                {userData?.creator?.username
                  ? userData?.creator?.username[0].toUpperCase()
                  : userData?.creator?.email[0].toUpperCase()}
              </div>
            )
          ) : (
            <div className="h-12 w-12 flex items-center justify-center relative">
              <Image
                alt={'Guest'}
                src={'/static/images/user.png'}
                height={44}
                width={44}
                className="rounded-full bg-white"
              />
            </div>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="z-10 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-2 ring-black focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <div
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-md font-bold text-gray-700 w-full text-center'
                )}
              >
                {authenticated ? session.user?.name : 'Guest'}
              </div>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) =>
              authenticated ? (
                <button
                  // onClick={() => {
                  //   if (keycloak) {
                  //     window.location.href = keycloak.createLogoutUrl()
                  //   }
                  // }}
                  onClick={() => logOutKeycloak()}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'block px-4 py-2 text-sm text-gray-700 cursor-pointer w-full'
                  )}
                >
                  Log Out
                </button>
              ) : (
                <button
                  // onClick={() => {
                  //   if (keycloak) {
                  //     window.location.href = keycloak.createLoginUrl()
                  //   }
                  // }}
                  // onClick={() => void auth.signinRedirect()}
                  onClick={() => signIn('keycloak')}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'block px-4 py-2 text-sm text-gray-700 cursor-pointer w-full'
                  )}
                >
                  Log In
                </button>
              )
            }
          </Menu.Item>
          {!authenticated && (
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={
                    () => props.setShowRegisterModal(true)
                    /*
										if (keycloak) {
											window.location.href = keycloak.createRegisterUrl()
										}
									*/
                  }
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'block px-4 py-2 text-sm text-gray-700 cursor-pointer w-full'
                  )}
                >
                  Register
                </button>
              )}
            </Menu.Item>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default Navatar
