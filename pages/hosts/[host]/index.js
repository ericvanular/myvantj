import React, { useState, useEffect, useRef, useContext } from 'react'
import Link from '@/components/Link'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import { PageSEO } from '@/components/SEO'
import PostGrid from '@/components/PostGrid'
import PlansPricing from '@/components/payments/PlansPricing'
import FollowModal from '@/components/FollowModal'
import TipModal from '@/components/TipModal'
import PaymentsModal from '@/components/PaymentsModal'
import siteMetadata from '@/data/siteMetadata'
import getCookie from '@/lib/utils/getCookie'
import { SiteContext } from 'pages/_app'
import API from '@/lib/api'
import Image from '@/components/Image'
import dynamic from 'next/dynamic'
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })
import remarkGfm from 'remark-gfm'

import { useSession, signIn, signOut } from 'next-auth/react'

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export async function getStaticProps(context) {
  const host = context.params.host
  const subdomain = host.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? host.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, '')
    : null
  // console.log('host: ' + host)
  // console.log('subdomain: ' + subdomain)
  // console.log(
  //   'API url: ' +
  //     `${process.env.NEXT_PUBLIC_API}/api/company?${
  //       subdomain ? `subdomain=${subdomain}` : `custom_domain=${host}`
  //     }`
  // )
  const profileData = await API(
    `${process.env.NEXT_PUBLIC_API}/api/company?${
      subdomain ? `subdomain=${subdomain}` : `custom_domain=${host}`
    }`
  )

  if (!profileData.result) {
    return {
      notFound: true,
    }
  }

  const { id, name, description, avatar_url } = profileData.org

  return {
    props: {
      //posts,
      host,
      orgId: id,
      name,
      description,
      avatar_url,
      // banner_url,
    },
    revalidate: 60,
  }
}

export default function Home({ orgId, host, name, description, avatar_url }) {
  const [pageIndex, setPageIndex] = useState(1)
  const [redirect, setRedirect] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [showTipModal, setShowTipModal] = useState(false)
  const [showPaymentsModal, setShowPaymentsModal] = useState(false)
  const [modalMode, setModalMode] = useState('')
  const [agreementItemId, setAgreementItemId] = useState('')

  const { data: session, status } = useSession()
  const authenticated = status === 'authenticated'
  const { partyData } = useContext(SiteContext)

  // const { data: partyData, error: partyError } = useSWR(
  //   [`${process.env.NEXT_PUBLIC_API}/api/company/${host.split('.')[0]}`, 'GET', session?.accessToken],
  //   fetchWithToken
  // )

  const getPaymentMethods = () => {
    const options = {
      method: 'get',
      url: `${process.env.NEXT_PUBLIC_API}/api/subscription/payment_method`,
    }
    API(options).then((data) => setPaymentMethods(data.payment_methods))
  }

  // const { data: paymentMethodsData, error: paymentMethodsError } = useSWR(
  //   authenticated
  //     ? [`${process.env.NEXT_PUBLIC_API}/api/subscription/payment_method`, 'GET', session?.accessToken]
  //     : null,
  //   fetchWithToken
  // )

  return (
    <>
      <PageSEO title={host} description={siteMetadata.description} />
      <PaymentsModal
        open={showPaymentsModal}
        setOpen={setShowPaymentsModal}
        name={name}
        host={host}
        pageIndex={pageIndex}
        // partyData={partyData}
        // banner_url={banner_url}
        avatarUrl={avatar_url}
        // paymentMethods={paymentMethodsData?.payment_methods}
        getPaymentMethods={getPaymentMethods}
        mode={modalMode}
        setMode={setModalMode}
        agreementItemId={agreementItemId}
      />
      {/* <FollowModal
        open={showFollowModal}
        setOpen={setShowFollowModal}
        name={name}
        host={host}
        pageIndex={pageIndex}
        partyData={partyData}
        // banner_url={banner_url}
        avatar_url={avatar_url}
        paymentMethods={paymentMethodsData?.payment_methods}
        getPaymentMethods={getPaymentMethods}
      />
      <TipModal
        open={showTipModal}
        setOpen={setShowTipModal}
        name={name}
        paymentMethods={paymentMethodsData?.payment_methods}
        getPaymentMethods={getPaymentMethods}
      /> */}
      {/* {banner_url && (
        <div className="h-60 lg:hidden flex items-center w-11/12 relative mx-auto lg:mx-0">
          <Image
            src={banner_url}
            layout="fill"
            alt={name}
            className="rounded-lg object-cover object-center"
          />
        </div>
      )} */}
      <header className="flex flex-col lg:flex-row justify-between w-full my-6 lg:min-h-72">
        <div className="flex flex-col justify-between text-center lg:text-left">
          <h1 className="font-bold text-gray-800 dark:text-gray-300 text-4xl md:text-6xl xl:text-7xl my-5">
            {name}
          </h1>
          {description && (
            <p className="font-normal text-sm sm:text-md lg:text-lg prose lg:prose-xl prose-a:text-blue-600 w-100">
              {/* {description.substring(0, 273) + '...'} */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
            </p>
          )}

          {/* UNCOMMENT THIS FOR TIPS */}

          {/* <div className="space-y-5 md:space-x-5">
            <button
              onClick={() => setShowTipModal(true)}
              className="font-semibold text-2xl w-full block md:w-1/5 md:inline px-8 py-3 font-medium text-black border-2 border-indigo-800 dark:border-white rounded-md bg-pink-400 hover:bg-pink-600 hover:text-white transiton ease-linear duration-300"
            >
              Tip
            </button>
            <button
              onClick={() => setShowFollowModal(true)}
              className="font-semibold text-2xl w-full block md:w-1/5 md:inline px-8 py-3 font-medium text-black border-2 border-indigo-800 dark:border-white rounded-md bg-purple-400 hover:bg-purple-800 hover:text-white transiton ease-linear duration-300"
            >
              Follow
            </button>
          </div> */}

          {/* <span className="font-normal text-gray-500 text-sm">I am currently open for part-time work.</span> */}
        </div>
        {avatar_url && (
          <img
            className="hidden lg:block rounded object-cover object-center"
            src={avatar_url}
            alt={avatar_url}
          />
          // <div className="flex items-center w-11/12 relative mx-auto lg:mx-0">
          //   <Image
          //     src={avatar_url}
          //     layout="fill"
          //     alt={name}
          //     className="rounded-lg object-cover object-top h-full"
          //   />
          // </div>
        )}
      </header>
      <hr className="text-pink-500 m-5 md:mx-0" />
      {/* <PostGrid
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        host={host}
        creatorId={id}
        setShow={setShowFollowModal}
      /> */}
      <PlansPricing
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        orgId={orgId}
        host={host}
        partyData={partyData}
        setModalMode={setModalMode}
        setShowPaymentsModal={setShowPaymentsModal}
        setAgreementItemId={setAgreementItemId}
      />
    </>
  )
}
