import { useState, useRef, useEffect, useContext } from 'react'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import useSWR from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'
import { SiteContext } from 'pages/_app'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import StripePaymentsModal from '@/components/payments/StripePaymentsModal'
import classNames from '@/lib/utils/classNames'

// import Button from '@/components/ui/Button';
import Link from 'next/link'
// import { useRouter } from 'next/navigation';

export default function PlansPricing() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [billingInterval, setBillingInterval] = useState('month')
  const [selectedProductCategory, setSelectedProductCategory] = useState('1 Pet Plans') // useState('All')
  const [selectedPrice, setSelectedPrice] = useState(null)

  const { data: session, status } = useSession()
  const authenticated = status === 'authenticated'
  const { partyData } = useContext(SiteContext)

  const { data: plansData, error: plansError } = useSWR(
    partyData?.id.length
      ? [
          `${process.env.NEXT_PUBLIC_API}/api/company/product-offerings/${partyData.id}?page=${pageIndex}`,
          'GET',
          session?.accessToken,
        ]
      : null,
    ([url, method, token]) => fetchWithToken(url, method, token)
  )

  const plans = plansData?.product_offerings

  const intervals = Array.from(new Set(plans?.flatMap((plan) => plan.uom_abbreviation)))
  const productCategories = Array.from(
    new Set(plans?.flatMap((plan) => plan.product_categories)) //.add('All')
  ).sort()

  if (!plans?.length)
    return (
      <section>
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center"></div>
          <p className="text-2xl font-extrabold sm:text-center sm:text-3xl">
            {partyData?.name} has no public offerings yet. Manage your business at{' '}
            <a
              className="text-blue-500 underline"
              href="https://app.vantj.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              app.vantj.com
            </a>
          </p>
        </div>
      </section>
    )

  return (
    <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
      <div className="sm:flex sm:flex-col sm:align-center">
        {showPaymentModal && (
          <StripePaymentsModal
            open={showPaymentModal}
            setOpen={setShowPaymentModal}
            selectedPrice={selectedPrice}
          />
        )}
        {/* <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl mb-6">Products & Services</h1> */}
        {/* <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Choose the service or plan that works best for you!
          </p> */}
        {/* Product Category Selector */}
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="productCategoryTabs"
            name="productCategoryTabs"
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            value={selectedProductCategory}
            onChange={(e) => setSelectedProductCategory(e.target.value)}
          >
            {productCategories.map((productCategory) => (
              <option key={productCategory} value={productCategory}>
                {productCategory}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex justify-center space-x-12" aria-label="Tabs">
            {productCategories.map((productCategory) => (
              <button
                key={productCategory}
                onClick={() => setSelectedProductCategory(productCategory)}
                className={classNames(
                  productCategory === selectedProductCategory
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2'
                )}
              >
                {productCategory}
              </button>
            ))}
          </nav>
        </div>
        <h4 className="mt-8 mb-6 text-xl text-center sm:text-2xl font-bold">Subscriptions</h4>
        <div className="relative self-center rounded-lg p-0.5 flex border border-zinc-800 dark:border-zinc-300">
          {intervals.includes('month') && (
            <button
              onClick={() => setBillingInterval('month')}
              type="button"
              className={`${
                billingInterval === 'month'
                  ? 'relative w-1/2 font-bold bg-gray-100 dark:bg-gray-500 border-gray-800 shadow-sm outline-none ring-2 ring-blue-600 z-10'
                  : 'ml-0.5 relative w-1/2 border border-transparent text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-800'
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap sm:w-auto flex-grow sm:px-8`}
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
                  ? 'relative w-1/2 font-bold bg-gray-100 dark:bg-gray-500 border-gray-800 shadow-sm outline-none ring-2 ring-blue-600 z-10'
                  : 'ml-0.5 relative w-1/2 border border-transparent text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-800'
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap sm:w-auto sm:px-8`}
            >
              Annual Billing
            </button>
          )}
        </div>
      </div>
      <div className="my-3 space-y-4 sm:my-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
        {plans.map((plan) => {
          const categoryIsSelected =
            plan.product_categories.includes(selectedProductCategory) ||
            selectedProductCategory === 'All'
          const billingIntervalIsSelected = plan.uom_abbreviation === billingInterval
          if (!categoryIsSelected || !billingIntervalIsSelected) return null
          const priceString = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(plan.price_component_price || 0)
          return (
            <div
              key={plan.price_component_id}
              className="rounded-lg divide-y divide-zinc-600 border border-zinc-800 dark:border-zinc-300"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6">{plan.product.name}</h2>
                <p className="mt-4">{plan.product.description}</p>
                <p className="mt-8">
                  {plan.price_component_comment && (
                    <p className="italic">{plan.price_component_comment}</p>
                  )}
                  <span className="text-3xl font-extrabold">{priceString}</span>
                  <span className="text-base font-medium ml-2">/ {billingInterval}</span>
                </p>
                <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                    onClick={() => {
                      setSelectedPrice(plan)
                      setShowPaymentModal(true)
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
                    onClick={() => getStripeData(price)}
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

      <h4 className="mt-8 mb-6 text-xl text-center sm:text-2xl font-bold">One Time Services</h4>
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
        {plans.map((plan) => {
          const categoryIsSelected =
            plan.product_categories.includes(selectedProductCategory) ||
            selectedProductCategory === 'All'
          const isOneTimePurchase = plan.uom_abbreviation === 'each'
          if (!categoryIsSelected || !isOneTimePurchase) return null
          const priceString = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(plan.price_component_price || 0)
          return (
            <div
              key={plan.price_component_id}
              className="rounded-lg divide-y divide-zinc-600 border border-zinc-800 dark:border-zinc-300"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6">{plan.product.name}</h2>
                <p className="mt-4">{plan.product.description}</p>
                <p className="mt-8">
                  <span className="text-3xl font-extrabold">{priceString}</span>
                  <span className="text-base font-medium ml-2">One Time</span>
                </p>
                <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="flex items-center justify-center border-solid w-full rounded-full bg-indigo-50 flex text-gray-800 background-transparent font-semibold uppercase px-6 py-2 text-md border border-2 hover:bg-indigo-700 hover:text-white outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                    onClick={() => {
                      setSelectedPrice(plan)
                      setShowPaymentModal(true)
                    }}
                  >
                    <div className="mx-3">Purchase</div>
                  </button>
                </div>
                {/* <Button
                    variant="slim"
                    type="button"
                    disabled={!session}
                    loading={priceIdLoading === price.id}
                    onClick={() => getStripeData(price)}
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
