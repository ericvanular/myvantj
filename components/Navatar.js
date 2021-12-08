import { useEffect, useState, Fragment } from 'react'
import Image from './Image'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import useSWR from 'swr'

import { useKeycloak } from '@react-keycloak/ssr'
//import { signIn, signOut, useSession } from 'next-auth/client'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Navatar = (props) => {
  const { keycloak } = useKeycloak()
  //const [session, loading] = useSession()

  const fetcher = async (url) => {
    const res = await fetch(url)
    return res.json()
  }

  const { data, error } = useSWR(
    keycloak?.tokenParsed?.preferred_username
      ? `https://app.jetpeak.co/api/creator/${keycloak?.tokenParsed?.preferred_username}`
      : null,
    fetcher
  )

  return (
    <Menu as="div" className="ml-3 relative">
      <div>
        <Menu.Button className="bg-white flex text-sm rounded-full ring-1 hover:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white">
          <span className="sr-only">Open User Menu</span>
          {keycloak?.authenticated ? (
            data?.creator?.avatar_url ? (
              <img
                className="h-12 w-12 rounded-full object-cover object-center"
                src={data?.creator.avatar_url}
                alt={data?.creator.username}
              />
            ) : (
              <div className="h-12 w-12 text-xl bg-indigo-800 text-white rounded-full font-semibold flex items-center justify-center">
                {data?.creator?.username
                  ? data?.creator?.username[0].toUpperCase()
                  : data?.creator?.email[0].toUpperCase()}
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
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <div
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-md font-bold text-gray-700 w-full text-center'
                )}
              >
                {keycloak?.authenticated ? keycloak?.tokenParsed?.preferred_username : 'Guest'}
              </div>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) =>
              keycloak?.authenticated ? (
                <button
                  onClick={() => {
                    if (keycloak) {
                      window.location.href = keycloak.createLogoutUrl()
                    }
                  }}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'block px-4 py-2 text-sm text-gray-700 cursor-pointer w-full'
                  )}
                >
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (keycloak) {
                      window.location.href = keycloak.createLoginUrl()
                    }
                  }}
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
          {!keycloak?.authenticated && (
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
