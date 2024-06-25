import { useState, useRef, useEffect, useContext } from 'react'
import formatDate from '@/lib/utils/formatDate'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import {
  validateEmail,
  validatePhoneNumber,
  formatPhoneNumber,
  validateAddress,
} from '@/lib/utils/utilsFunctions'
import useSWR from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'
import { SiteContext } from 'pages/_app'
import { ArrowLeftCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import classNames from '@/lib/utils/classNames'
import SubscriptionManagementModal from '@/components/payments/SubscriptionManagementModal'

// import Button from '@/components/ui/Button';
import Link from 'next/link'
// import { useRouter } from 'next/navigation';

export default function Subscriptions() {
  const [pageIndex, setPageIndex] = useState(1)
  const [selectedSubscriptionStatus, setSelectedSubscriptionStatus] = useState('All')
  const [showSubscriptionManagementModal, setShowSubscriptionManagementModal] = useState(false)
  const [modalMode, setModalMode] = useState('')
  const [agreementId, setAgreementId] = useState(null)

  const { data: session, status } = useSession()
  const authenticated = status === 'authenticated'
  const { partyData } = useContext(SiteContext)

  const { data: userData, error: userError } = useSWR(
    [`${process.env.NEXT_PUBLIC_API}/api/user/profile`, 'GET', session?.accessToken],
    ([url, method, token]) => fetchWithToken(url, method, token)
  )

  const { data: subscriptionsData, error: subscriptionsError } = useSWR(
    partyData?.id.length
      ? [
          `${process.env.NEXT_PUBLIC_API}/api/company/subscriptions/${partyData.id}?page=${pageIndex}`,
          'GET',
          session?.accessToken,
        ]
      : null,
    ([url, method, token]) => fetchWithToken(url, method, token)
  )

  const profileValidation = {
    person_name: !!(userData?.user.fname && userData?.user.fname),
    // company_name: companyView ? !!user?.name : true,
    emails:
      userData?.emails.length > 1
        ? userData?.emails.map((email) => validateEmail(email.email))
        : userData?.emails[0]?.email
        ? [validateEmail(userData?.emails[0].email)]
        : [false],
    phones:
      userData?.phones.length > 1
        ? userData?.phones.map((phone) => validatePhoneNumber(phone.number))
        : userData?.phones[0]?.number
        ? [validatePhoneNumber(userData?.phones[0].number)]
        : [false],
    addresses:
      userData?.addresses.length > 1
        ? userData?.addresses.map((address) => validateAddress(address))
        : userData?.addresses[0]
        ? [validateAddress(userData?.addresses[0])]
        : [false],
  }

  const subscriptionStatuses = Array.from(
    new Set(
      subscriptionsData?.agreements?.flatMap((agreement) =>
        agreement.agreement_statuses?.flatMap((agreement_status) => agreement_status.description)
      )
    )
  ).sort()

  return (
    <>
      {subscriptionsData?.agreements?.length != 0 &&
        !(
          profileValidation.person_name &&
          profileValidation.emails.every(Boolean) &&
          profileValidation.phones.every(Boolean) &&
          profileValidation.addresses.every(Boolean)
        ) && (
          <Link href="/profile/edit">
            <div className="rounded-md bg-yellow-100 dark:bg-blue-600 p-4 hover:bg-yellow-200 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 flex justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold">Please complete your profile details.</h3>
                    <div className="mt-1 text-xs">
                      <ul role="list" className="list-disc space-y-1 pl-5">
                        {!profileValidation.person_name && <li>Your name has not been added.</li>}
                        {!profileValidation.phones.every(Boolean) && (
                          <li>A valid phone number has not been added.</li>
                        )}
                        {!profileValidation.addresses.every(Boolean) && (
                          <li>A valid & complete address has not been added.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="text-sm flex flex-col justify-center align-items">
                    <div className="whitespace-nowrap text-xl font-medium">
                      <span aria-hidden="true"> &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-2xl font-extrabold sm:text-center sm:text-5xl">
            Your Subscription(s)
          </h1>
          <p className="max-w-2xl m-auto my-5 text-md sm:text-center sm:text-xl">
            Details on your current and past subscriptions.
          </p>
          {/* <div className="relative flex self-center mt-12 border rounded-lg bg-zinc-900 border-zinc-800">
              <div className="border border-pink-500 border-opacity-50 divide-y rounded-lg shadow-sm bg-zinc-900 divide-zinc-600">
                <div className="p-6 py-2 m-1 text-2xl font-medium rounded-md shadow-sm border-zinc-800 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8">
                  {subscriptions.product.name}
                </div>
              </div>
            </div> */}
          {/* Subscription Status Selector */}
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="subscriptionStatusTabs"
              name="subscriptionStatusTabs"
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={selectedSubscriptionStatus}
              onChange={(e) => setSelectedSubscriptionStatus(e.target.value)}
            >
              {['All', ...subscriptionStatuses].map((subscriptionStatus) => (
                <option key={subscriptionStatus} value={subscriptionStatus}>
                  {subscriptionStatus}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex justify-center space-x-12" aria-label="Tabs">
              {['All', ...subscriptionStatuses].map((subscriptionStatus) => (
                <button
                  key={subscriptionStatus}
                  onClick={() => setSelectedSubscriptionStatus(subscriptionStatus)}
                  className={classNames(
                    subscriptionStatus === selectedSubscriptionStatus
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2'
                  )}
                >
                  {subscriptionStatus}
                </button>
              ))}
            </nav>
          </div>
          {subscriptionsData?.agreements?.length === 0 ? (
            <>
              <div className="relative flex self-center mt-12 border rounded-lg border-zinc-800">
                <div className="border border-pink-500 border-opacity-50 divide-y rounded-lg shadow-sm divide-zinc-600">
                  <div className="p-6 py-2 m-1 text-2xl font-medium rounded-md shadow-sm border-zinc-800 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8">
                    No subscriptions yet!
                  </div>
                </div>
              </div>
              <div className="mt-8 py-4 flex justify-center">
                <Link
                  href="/"
                  className={classNames(
                    'flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-xl font-medium rounded-md text-gray-800 bg-gray-100 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  )}
                >
                  <ArrowLeftCircleIcon className="h-6 w-6 mr-4" />
                  <div className="">Home</div>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-6 space-y-4 sm:mt-12 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
              <SubscriptionManagementModal
                open={showSubscriptionManagementModal}
                setOpen={setShowSubscriptionManagementModal}
                mode={modalMode}
                setMode={setModalMode}
                agreementId={agreementId}
              />
              {subscriptionsData?.agreements?.map((subscription) => {
                const currentStatus = subscription.agreement_statuses.sort(
                  (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                )[0]
                const statusIsSelected =
                  currentStatus.description === selectedSubscriptionStatus ||
                  selectedSubscriptionStatus === 'All'
                if (!statusIsSelected) return null
                // subscription.agreement_items.map((agreement_item) => {
                const priceString =
                  subscription.agreement_items[0]?.price_components[0]?.price &&
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD', // price.currency,
                    minimumFractionDigits: 0,
                  }).format(subscription.agreement_items[0]?.price_components[0]?.price)
                return (
                  <div
                    key={subscription.agreement.id}
                    className="divide-y rounded-lg shadow-sm divide-gray-600 border border-gray-800 dark:border-gray-300"
                  >
                    <div className="p-6">
                      <span
                        className={classNames(
                          currentStatus.description === 'Active'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800',
                          'inline-flex items-center rounded-full px-3 py-0.5 mb-4 text-md font-semibold'
                        )}
                      >
                        {currentStatus.description}
                      </span>
                      <p className="font-extrabold text-2xl sm:text-3xl">
                        {subscription.agreement_items[0]?.price_components[0]?.product}
                      </p>
                      <p>
                        <span className="mt-4 text-xl white">{priceString} </span>
                        <span className="text-xl font-medium">
                          / {subscription.agreement_items[0]?.price_components[0]?.uom}
                        </span>
                      </p>
                      {/* <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                          <button
                            className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                            onClick={() => getStripeData(price[0].id)}
                          >
                            <div className="mx-3">
                              Change Plan
                            </div>
                          </button>
                        </div> */}
                      {/* <div className="flex items-center justify-end pt-6 border-solid border-blueGray-200 rounded-b">
                          <button
                            className="flex items-center justify-center border-solid w-full rounded-full bg-yellow-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-yellow-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                            onClick={() => {
                              setAgreementId(subscription.agreement_item_id)
                              setModalMode('pause')
                              setShowPaymentsModal(true)
                              
                            }}
                          >
                            <div className="mx-3">
                              Pause
                            </div>
                          </button>
                        </div> */}
                      {currentStatus.description != 'Canceled' && (
                        <div className="flex items-center justify-end pt-6 border-solid border-blueGray-200 rounded-b">
                          <button
                            className="flex items-center justify-center border-solid w-full rounded-full bg-red-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-red-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                            onClick={() => {
                              setAgreementId(subscription.agreement.id)
                              setModalMode('cancel')
                              setShowSubscriptionManagementModal(true)
                            }}
                          >
                            <div className="mx-3">Cancel</div>
                          </button>
                        </div>
                      )}
                      {/* <button
                          variant="slim"
                          type="button"
                          disabled={false}
                          loading={priceIdLoading === price.id}
                          onClick={() => getStripeData(price)}
                          className="block w-full py-2 mt-12 text-sm font-semibold text-center text-white rounded-md hover:bg-zinc-900 "
                        >
                          {plans[0].name ===
                          subscription?.prices?.plans?.name
                            ? 'Manage'
                            : 'Subscribe'}
                        </Button> */}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
