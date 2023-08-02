import { useState, useRef, useEffect } from 'react'
import API from '@/lib/api'
import formatDate from '@/lib/utils/formatDate'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import generateFileUrl from '@/lib/utils/generateFileUrl'
import useSWR from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'
// import { useKeycloak } from '@react-keycloak-fork/ssr'

// import Button from '@/components/ui/Button';
// import { planData } from '@/lib/utils/helpers';
import { getStripe } from '@/lib/utils/stripe-client'
// import { Session, User } from '@supabase/supabase-js';
// import cn from 'classnames';
// import { useRouter } from 'next/navigation';

// type BillingInterval = 'lifetime' | 'year' | 'month';

export default function PlansPricing({
  host,
  pageIndex,
  setPageIndex,
  setShowPaymentsModal,
  setModalMode,
  setAgreementItemId,
}) {
  const [sessionId, setSessionId] = useState('')
  const [billingInterval, setBillingInterval] = useState('month')
  const [priceIdLoading, setPriceIdLoading] = useState('')

  const { data: session, status } = useSession()
  // const { keycloak } = useKeycloak()

  const { data: plansData, error: plansError } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_API}/api/company/public_products/${
        host.split('.')[0]
      }?page=${pageIndex}`,
      'GET',
      session?.accessToken,
    ],
    fetchWithToken
  )

  const plans = plansData?.public_products
  const subscriptions = plansData?.subscriptions.slice(0, 1)

  const intervals = Array.from(new Set(plans?.flatMap((plan) => plan.uom_abbreviation)))
  // const router = useRouter();

  const handleCheckout = async (priceId, mode) => {
    // setPriceIdLoading(price.id);
    // const vendorPriceId = 'price_1NLZh9IRuYHBw2UMUMxHMs8c'
    // const vendorAccountId = 'acct_1GsJglIRuYHBw2UM'
    // if (!user) {
    //   return router.push('/signin');
    // }
    // if (price.product_id === subscription?.prices?.products?.id) {
    //   return router.push('/account');
    // }
    try {
      const sessionResponse = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API}/api/subscription/create_checkout`,
        'POST',
        session?.accessToken,
        { priceId, mode }
      )
      if (sessionResponse?.id) {
        const stripe = await getStripe(sessionResponse.external_account_id)
        stripe?.redirectToCheckout({ sessionId: sessionResponse.id })
        // setStatus('checkout')
      } else {
        console.log(sessionResponse)
        // setStatus(['failure', response.error])
      }
    } catch (error) {
      return alert(error?.message)
    } finally {
      setPriceIdLoading(undefined)
    }
  }

  if (
    subscriptions?.length &&
    !subscriptions.find((subscription) => subscription.agreement_status_description === 'Canceled')
  )
    return (
      <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">Your Active Plan</h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Details on your current subscription plan.
          </p>
          {/* <div className="relative flex self-center mt-12 border rounded-lg bg-zinc-900 border-zinc-800">
              <div className="border border-pink-500 border-opacity-50 divide-y rounded-lg shadow-sm bg-zinc-900 divide-zinc-600">
                <div className="p-6 py-2 m-1 text-2xl font-medium rounded-md shadow-sm border-zinc-800 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8">
                  {subscriptions.product.name}
                </div>
              </div>
            </div> */}
          <div className="mt-6 space-y-4 sm:mt-12 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
            {subscriptions.map((subscription) => {
              const priceString =
                subscription.price_component_price &&
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD', // price.currency,
                  minimumFractionDigits: 0,
                }).format(subscription.price_component_price)

              return (
                <div
                  key={subscription.agreement_item_id}
                  className="divide-y rounded-lg shadow-sm divide-zinc-600 bg-zinc-900 border border-zinc-800"
                >
                  <div className="p-6">
                    <p className="font-extrabold text-3xl text-zinc-300">
                      {subscription.product_name}
                    </p>
                    <p>
                      <span className="mt-4 text-xl white">{priceString}</span>
                      <span className="text-xl font-medium text-zinc-100">
                        /{subscription.uom_abbreviation}
                      </span>
                    </p>
                    {/* <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                        <button
                          className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                          onClick={() => handleCheckout(price[0].id)}
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
                            setAgreementItemId(subscription.agreement_item_id)
                            setModalMode('pause')
                            setShowPaymentsModal(true)
                            
                          }}
                        >
                          <div className="mx-3">
                            Pause
                          </div>
                        </button>
                      </div> */}
                    <div className="flex items-center justify-end pt-6 border-solid border-blueGray-200 rounded-b">
                      <button
                        className="flex items-center justify-center border-solid w-full rounded-full bg-red-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-red-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                        onClick={() => {
                          setAgreementItemId(subscription.agreement_item_id)
                          setModalMode('cancel')
                          setShowPaymentsModal(true)
                        }}
                      >
                        <div className="mx-3">Cancel</div>
                      </button>
                    </div>
                    {/* <button
                        variant="slim"
                        type="button"
                        disabled={false}
                        loading={priceIdLoading === price.id}
                        onClick={() => handleCheckout(price)}
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
        </div>
      </div>
    )

  if (!plans?.length)
    return (
      <section className="bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center"></div>
          <p className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            No subscription pricing plans found. Create them in your{' '}
            <a
              className="text-blue-500 underline"
              href="https://app.vantj.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Vantj Dashboard
            </a>
            .
          </p>
        </div>
      </section>
    )

  if (plans?.length === 1)
    return (
      <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">
            Products & Services
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Choose the service or plan that works best for you!
          </p>
          <div className="relative flex self-center mt-12 border rounded-lg bg-zinc-900 border-zinc-800">
            <div className="border border-pink-500 border-opacity-50 divide-y rounded-lg shadow-sm bg-zinc-900 divide-zinc-600">
              <div className="p-6 py-2 m-1 text-2xl font-medium rounded-md shadow-sm border-zinc-800 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8">
                {plans[0].product.name}
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-4 sm:mt-12 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
            {plans[0].price_components?.map((price) => {
              const priceString =
                price[0].price &&
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD', // price.currency,
                  minimumFractionDigits: 0,
                }).format(price[0].price)

              return (
                <div
                  key={price[1].id}
                  className="divide-y rounded-lg shadow-sm divide-zinc-600 bg-zinc-900 border border-zinc-800"
                >
                  <div className="p-6">
                    <p>
                      <span className="text-5xl font-extrabold white">{priceString}</span>
                      <span className="text-base font-medium text-zinc-100">
                        /{price[1].abbreviation}
                      </span>
                    </p>
                    <p className="mt-4 text-zinc-300">{plans[0].product.description}</p>
                    <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                      <button
                        className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                        onClick={() =>
                          session?.accessToken
                            ? handleCheckout(price[0].id, 'subscription')
                            : setShowPaymentsModal(true)
                        }
                      >
                        <div className="mx-3">Subscribe</div>
                      </button>
                    </div>
                    {/* <button
                        variant="slim"
                        type="button"
                        disabled={false}
                        loading={priceIdLoading === price.id}
                        onClick={() => handleCheckout(price)}
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
        </div>
      </div>
    )

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">Products & Services</h1>
        {/* <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Choose the service or plan that works best for you!
          </p> */}
        <h4 className="mt-12 text-2xl text-center sm:text-3xl underline">Subscriptions</h4>
        <div className="relative self-center bg-zinc-900 rounded-lg p-0.5 flex mt-6 sm:mt-8 border border-zinc-800">
          {intervals.includes('month') && (
            <button
              onClick={() => setBillingInterval('month')}
              type="button"
              className={`${
                billingInterval === 'month'
                  ? 'relative w-1/2 bg-gray-100 border-gray-900 shadow-sm outline-none ring-2 ring-gray-800 ring-opacity-50 z-10'
                  : 'ml-0.5 relative w-1/2 border border-transparent text-gray-800'
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap sm:w-auto sm:px-8`}
            >
              Monthly Billing
            </button>
          )}
          {intervals.includes('year') && (
            <button
              onClick={() => setBillingInterval('year')}
              type="button"
              className={`${
                billingInterval === 'year'
                  ? 'relative w-1/2 bg-gray-100 border-gray-800 shadow-sm outline-none ring-2 ring-gray-800 ring-opacity-50 z-10'
                  : 'ml-0.5 relative w-1/2 border border-transparent text-gray-800'
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap sm:w-auto sm:px-8`}
            >
              Annual Billing
            </button>
          )}
        </div>
      </div>
      <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
        {plans.map((plan) => {
          const price = plan.uom_abbreviation === billingInterval
          if (!price) return null
          const priceString = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(plan.price_component_price || 0)
          return (
            <div
              key={plan.price_component_id}
              className="rounded-lg divide-y divide-zinc-600 border border-zinc-800 bg-zinc-900"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6">{plan.product_name}</h2>
                <p className="mt-4 text-zinc-300">{plan.product_description}</p>
                <p className="mt-8">
                  <span className="text-3xl font-extrabold">{priceString}</span>
                  <span className="text-base font-medium text-zinc-100 ml-2">
                    / {billingInterval}
                  </span>
                </p>
                <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                    onClick={() => {
                      session?.accessToken
                        ? handleCheckout(plan.price_component_id, 'subscription')
                        : setShowPaymentsModal(true)
                      setAgreementItemId(plan.agreement_item_id)
                    }}
                  >
                    <div className="mx-3">Subscribe</div>
                  </button>
                </div>
                {/* <Button
                    variant="slim"
                    type="button"
                    disabled={!session}
                    loading={priceIdLoading === price.id}
                    onClick={() => handleCheckout(price)}
                    className="block w-full py-2 mt-8 text-sm font-semibold text-center text-white rounded-md hover:bg-zinc-900"
                  >
                    {plan.name === subscription?.prices?.plans?.name
                      ? 'Manage'
                      : 'Subscribe'}
                  </Button> */}
              </div>
            </div>
          )
        })}
      </div>

      <h4 className="mt-12 text-2xl text-center sm:text-3xl underline">One Time Services</h4>
      <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
        {plans.map((plan) => {
          const price = plan.uom_abbreviation === 'each'
          if (!price) return null
          const priceString = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(plan.price_component_price || 0)
          return (
            <div
              key={plan.price_component_id}
              className="rounded-lg divide-y divide-zinc-600 border border-zinc-800 bg-zinc-900"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6">{plan.product_name}</h2>
                <p className="mt-4 text-zinc-300">{plan.product_description}</p>
                <p className="mt-8">
                  <span className="text-3xl font-extrabold">{priceString}</span>
                  <span className="text-base font-medium text-zinc-100 ml-2">One Time</span>
                </p>
                <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                    onClick={() =>
                      session?.accessToken
                        ? handleCheckout(plan.price_component_id, 'payment')
                        : setShowPaymentsModal(true)
                    }
                  >
                    <div className="mx-3">Purchase</div>
                  </button>
                </div>
                {/* <Button
                    variant="slim"
                    type="button"
                    disabled={!session}
                    loading={priceIdLoading === price.id}
                    onClick={() => handleCheckout(price)}
                    className="block w-full py-2 mt-8 text-sm font-semibold text-center text-white rounded-md hover:bg-zinc-900"
                  >
                    {plan.name === subscription?.prices?.plans?.name
                      ? 'Manage'
                      : 'Subscribe'}
                  </Button> */}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

//   return (
//     <>
//       <div className={`max-w-full my-2 flex flex-wrap flex-row ${!plans?.length ? 'hidden' : ''}`}>
//         {!plans && <div className="leading-relaxed m-2">Loading plans...</div>}
//         {plans?.length &&
//           plans
//             .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
//             .map((plan) => {
//               return (
//                 <div key={plan.id} className="p-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 hover:shadow-l">
//                   <div className="w-full h-60 relative overflow-hidden border-2 border-gray-200 rounded-lg border-opacity-60 dark:border-gray-700 transform duration-500 hover:shadow-2xl cursor-pointer hover:scale-[1.01]">
//                     {plan.files ? (
//                       <>
//                         {plan.files[0].mime_type.match('video.*') ? (
//                           <VideoPlayer
//                             options={videoJsOptions(
//                               generateFileUrl(creatorId, plan.files[0].file_name),
//                               plan.files[0].mime_type
//                             )}
//                             onReady={handlePlayerReady}
//                           />
//                         ) : (
//                           <Image
//                             alt={plan.description}
//                             src={generateFileUrl(creatorId, plan.files[0].file_name)}
//                             className="object-cover object-top"
//                             layout="fill"
//                             onMouseDown={() =>
//                               openLightbox(generateFileUrl(creatorId, plan.files[0].file_name))
//                             }
//                           />
//                         )}
//                       </>
//                     ) : (
//                       <div className="flex justify-center items-center p-4 w-full h-60 bg-gradient-to-tr from-indigo-100 via-pink-200 to-purple-300 background-animate">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                           className="text-gray-900 absolute w-40 h-40 object-cover object-center"
//                         >
//                           <path d="M14,15c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S14,13.9,14,15z" />
//                           <path
//                             fill="none"
//                             stroke="currentColor"
//                             strokeMiterlimit="10"
//                             strokeWidth="2"
//                             d="M17 9c0 0 0-1.6 0-2 0-2.8-2.2-5-5-5S7 4.2 7 7c0 .4 0 2 0 2M18 21H6c-.552 0-1-.448-1-1V10c0-.552.448-1 1-1h12c.552 0 1 .448 1 1v10C19 20.552 18.552 21 18 21z"
//                           />
//                         </svg>
//                         <button
//                           className="rounded relative z-10 w-full h-full opacity-0 hover:opacity-100 cursor-pointer flex flex-row items-center justify-center"
//                           onClick={() => setShowPaymentsModal(true)}
//                         >
//                           <div className="inline-flex items-center leading-none bg-indigo-50 rounded-full p-2 shadow text-black text-4xl border border-gray-400">
//                             <span className="inline-flex bg-black text-white rounded-full p-4 justify-center items-center font-semibold">
//                               FOLLOW
//                             </span>
//                           </div>
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )
//             })}
//         {viewerIsOpen && (
//           <Lightbox
//             mainSrc={currentImage}
//             nextSrc={null}
//             prevSrc={null}
//             onCloseRequest={closeLightbox}
//             onMovePrevRequest={null}
//             onMoveNextRequest={null}
//             discourageDownloads={false}
//             clickOutsideToClose={true}
//             animationDuration={100}
//             // imageTitle={creator.username}
//           />
//         )}
//       </div>
//       <div className="flex justify-between mt-8">
//         <div
//           className={`flex justify-start text-lg font-medium leading-6 ${
//             !plansData?.prev_num ? 'invisible' : ''
//           }`}
//         >
//           <div
//             disabled={!plansData?.next_num}
//             id="next-page"
//             onClick={() => setPageIndex(pageIndex - 1)}
//             className="text-primary-500 hover:text-primary-800 dark:hover:text-primary-400 cursor-pointer"
//             aria-label="all plans"
//           >
//             &larr; Previous Page
//           </div>
//         </div>
//         <div
//           className={`flex justify-end text-lg font-medium leading-6 ${
//             !plansData?.next_num ? 'invisible' : ''
//           }`}
//         >
//           <div
//             disabled={!plansData?.next_num}
//             id="next-page"
//             onClick={() => setPageIndex(pageIndex + 1)}
//             className="text-primary-500 hover:text-primary-800 dark:hover:text-primary-400 cursor-pointer"
//             aria-label="all plans"
//           >
//             Next Page &rarr;
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }
