import { useState, useRef, useEffect, useContext } from 'react'
import API from '@/lib/api'
import Link from '@/components/Link'
import formatDate from '@/lib/utils/formatDate'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import generateFileUrl from '@/lib/utils/generateFileUrl'
import { displayAddress } from '@/lib/utils/utilsFunctions'
import useSWR from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'
import { SiteContext } from 'pages/_app'

import { Switch, Disclosure } from '@headlessui/react'
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector'
import {
  ArrowLeftCircleIcon,
  AdjustmentsHorizontalIcon,
  EnvelopeIcon,
  PencilIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

const urlEncodedAddress = (address) => encodeURIComponent(address)

export default function ProfileSettings() {
  const { data: session, status } = useSession()
  const authenticated = status === 'authenticated'
  const { partyData } = useContext(SiteContext)

  const { data: userData, error: userError } = useSWR(
    [`${process.env.NEXT_PUBLIC_API}/api/user/profile`, 'GET', session?.accessToken],
    ([url, method, token]) => fetchWithToken(url, method, token)
  )

  // const { data: plansData, error: plansError } = useSWR(
  //   [
  //     `${process.env.NEXT_PUBLIC_API}/api/company/public_products/${partyData?.id}`,
  //     'GET',
  //     session?.accessToken,
  //   ],
  //   ([url, method, token]) => fetchWithToken(url, method, token)
  // )

  // const subscriptions = plansData?.subscriptions.slice(0, 1)

  // const progressBarPct = [email?.email, user?.fname, user?.lname, phone?.number, (avatarUrl || avatarChanged)].filter(Boolean).length * 100 / 6
  // const displayName = (user.fname && user.lname && !companyView) ? user.fname + ' ' + user.lname : (user.name && companyView) ? user.name : 'User Details'

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <>
      {/* Profile header */}
      <div className="">
        <div className="py-4 flex justify-center">
          <Link
            href="/"
            className={classNames(
              'w-full flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-xl font-medium rounded-md text-gray-800 bg-gray-100 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            )}
          >
            <ArrowLeftCircleIcon className="h-6 w-6 mr-4" />
            <div className="">Home</div>
          </Link>
        </div>
        {/* <div>
            <img className="h-32 w-full object-cover lg:h-48" src={profile.coverImageUrl} alt="" />
            </div> */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200">
          <div className="my-4 sm:my-6 sm:flex sm:justify-center sm:items-end sm:space-x-5">
            <div className="sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-center sm:space-x-6">
              <div className="sm:hidden flex items-center">
                {userData?.avatarUrl ? (
                  <img
                    className="h-16 w-16 rounded-full ring-2 ring-gray-700 object-cover"
                    src={userData?.avatarUrl}
                    alt=""
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full ring-2 ring-gray-700 flex items-center justify-center">
                    {userData?.user.fname && userData?.user.lname
                      ? userData?.user.fname?.charAt(0).toUpperCase() +
                        userData?.user.lname?.charAt(0).toUpperCase()
                      : userData?.emails[0].email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="ml-4 sm:hidden block">
                  <h1 className="text-xl font-bold truncate">
                    {userData?.user.fname && userData?.user.lname
                      ? userData?.user.fname + ' ' + userData?.user.lname
                      : userData?.emails[0].email}
                  </h1>
                </div>
              </div>
              {userData?.avatarUrl ? (
                <img
                  className="hidden sm:block h-16 w-16 rounded-full ring-2 ring-gray-700 object-cover"
                  src={userData?.avatarUrl}
                  alt=""
                />
              ) : (
                <div className="hidden sm:block h-16 w-16 rounded-full ring-2 ring-gray-700">
                  <span className="flex items-center justify-center h-full">
                    {userData?.user.fname && userData?.user.lname
                      ? userData?.user.fname?.charAt(0).toUpperCase() +
                        userData?.user.lname?.charAt(0).toUpperCase()
                      : userData?.emails[0].email.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="hidden sm:block min-w-0 flex-1">
                <h1 className="text-2xl font-bold truncate">
                  {userData?.user.fname && userData?.user.lname
                    ? userData?.user.fname + ' ' + userData?.user.lname
                    : userData?.emails[0].email}
                </h1>
              </div>
              <div className="mt-6 sm:mt-0 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                {/* <button
                          type="button"
                          className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      >
                          <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                          <span>Message</span>
                      </button> */}
                <Link
                  href="/profile/edit"
                  type="button"
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  <PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span>Edit</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          {userData?.user.fname && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">First Name</dt>
              <dd className="mt-1 text-sm">{userData?.user.fname}</dd>
            </div>
          )}
          {userData?.user.lname && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Last Name</dt>
              <dd className="mt-1 text-sm">{userData?.user.lname}</dd>
            </div>
          )}
          {userData?.user.username && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Company Name</dt>
              <dd className="mt-1 text-sm">{userData?.user.username}</dd>
            </div>
          )}
          {userData?.emails.map((email, idx) => (
            <div key={email.id} className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm">{email.email}</dd>
            </div>
          ))}
          {userData?.phones.map((phone, idx) => (
            <div key={phone.id} className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm">{phone.number}</dd>
            </div>
          ))}
          {userData?.addresses.map((address, idx) => (
            <div key={address.id} className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm underline text-blue-600 hover:text-blue-800">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${urlEncodedAddress(
                    displayAddress(address)
                  )}`}
                >
                  {displayAddress(address)}
                </a>
              </dd>
            </div>
          ))}
          {userData?.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">About</dt>
              <dd className="mt-1 text-sm">{userData?.description}</dd>
            </div>
          )}
          {userData?.company?.name && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="mt-1 text-sm">{userData?.company.name}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* USE THIS APPROACH FOR CUSTOM ATTRIBUTES!!! Loop through Object keys and display them here */}

      {/* <div className="mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {Object.keys(userData).map((field) => (
                <div key={field} className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{field}</dt>
                <dd className="mt-1 text-sm">{userData[field]}</dd>
                </div>
            ))}
            <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">About</dt>
                <dd
                className="mt-1  text-sm space-y-5"
                dangerouslySetInnerHTML={{ __html: userData?.description }}
                />
            </div>
            </dl>
        </div> */}

      {/* Team member list */}
      {/* <div className="mt-8 max-w-5xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
            <h2 className="text-sm font-medium text-gray-500">Team Members</h2>
            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {team.map((userData) => (
                <div
                key={userData?.handle}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                >
                <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full object-cover" src={userData?.imageUrl} alt="" />
                </div>
                <div className="flex-1 min-w-0">
                    <a href="#" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium">{userData?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{userData?.role}</p>
                    </a>
                </div>
                </div>
            ))}
            </div>
        </div> */}
    </>
  )
}
