import React, { useState, useEffect, useRef } from 'react'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import PostGrid from '@/components/PostGrid'
import FollowModal from '@/components/FollowModal'
import TipModal from '@/components/TipModal'
import siteMetadata from '@/data/siteMetadata'
import getCookie from '@/lib/utils/getCookie'
import API from '@/lib/api'
import Image from '@/components/Image'

import useSWR from 'swr'

const MAX_DISPLAY = 5

import { useKeycloak } from '@react-keycloak/ssr'

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export async function getStaticProps(context) {
  const host = context.params.host
  //const postsData = await API(`https://app.jetpeak.co/api/creator/posts/eric`)
  const profileData = await API(`https://app.jetpeak.co/api/creator/${host.split('.')[0]}`)

  if (!profileData.result) {
    return {
      notFound: true,
    }
  }

  const { id, username, description, avatar_url, banner_url } = profileData.creator
  //const { posts } = postsData

  return {
    props: {
      //posts,
      host,
      id,
      username,
      description,
      avatar_url,
      banner_url,
    },
    // revalidate: 10,
  }
}

export default function Home({ host, id, username, description, avatar_url, banner_url }) {
  const [redirect, setRedirect] = useState(false)
  const [creator, setCreator] = useState({})
  const [posts, setPosts] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [showTipModal, setShowTipModal] = useState(false)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [showUnfollowModal, setShowUnfollowModal] = useState(false)

  const { keycloak } = useKeycloak()

  const parsedToken = keycloak?.tokenParsed

  /*
  const { data, error, isValidating } = useSWR(
    `http://localhost:5000/api/creator/posts/${host.split('.')[0]}`,
    (url) =>
      fetch(url, {
        headers: {
          Authorization: `Bearer ${parsedToken}`, //${getCookie('next-auth.session-token')}`,
        },
        credentials: 'include',
      }).then((res) => res.json()),
    {
      // Silently refresh token every expiry time
      //refreshInterval: 45,
    }
  )
  */

  const fetchWithToken = async (url, token) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.json()
  }

  const getCreator = () => {
    const options = {
      method: 'get',
      url: `https://app.jetpeak.co/api/creator/${host}`,
    }
    API(options)
      .then((data) => setCreator(data.creator))
      .catch(() => setRedirect(true))
  }

  const getPosts = (page) => {
    const options = {
      method: 'get',
      url: username
        ? `https://app.jetpeak.co/api/creator/posts/${username}?page=${page}`
        : `https://app.jetpeak.co/api/creator/posts?page=${page}`,
    }
    API(options)
      .then((data) => {
        setPosts(data.posts)
      })
      .catch(() => setRedirect(true))
  }

  const getPaymentMethods = () => {
    const options = {
      method: 'get',
      url: 'https://app.jetpeak.co/api/subscription/payment_method',
    }
    API(options).then((data) => setPaymentMethods(data.payment_methods))
  }

  const { data: paymentMethodsData, error: paymentMethodsError } = useSWR(
    keycloak?.token
      ? [`https://app.jetpeak.co/api/subscription/payment_method`, keycloak?.token]
      : null,
    fetchWithToken
  )

  const { data: postsData, error: postsError } = useSWR(
    [`https://app.jetpeak.co/api/creator/posts/${host.split('.')[0]}`, keycloak?.token],
    fetchWithToken
  )

  {
    /*
    useEffect(() => {
		if (props.username) {
			getPlans()
		}
	}, [props.username])
    */
  }

  return (
    <>
      <PageSEO title={host} description={siteMetadata.description} />
      <FollowModal
        open={showFollowModal}
        setOpen={setShowFollowModal}
        username={username}
        getCreator={getCreator}
        getPosts={getPosts}
        banner_url={banner_url}
        avatar_url={avatar_url}
        paymentMethods={paymentMethodsData?.payment_methods}
        getPaymentMethods={getPaymentMethods}
      />
      <TipModal
        open={showTipModal}
        setOpen={setShowTipModal}
        username={username}
        paymentMethods={paymentMethodsData?.payment_methods}
        getPaymentMethods={getPaymentMethods}
      />

      {banner_url && (
        <div className="lg:hidden">
          <img
            src={banner_url}
            layout="fill"
            alt={username}
            className="rounded-lg object-cover object-top border"
          />
        </div>
      )}

      <header className="flex flex-col lg:flex-row justify-between my-6 lg:min-h-72">
        <div className="flex flex-col justify-between min-w-[66%] text-center lg:text-left lg:mr-12">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <span className="w-2/3 h-0.5 bg-pink-500"></span>
            {/* <p className="font-medium text-indigo-700 text-xl">Petra</p> */}
          </div>
          <h1 className="font-bold text-gray-800 dark:text-pink-400 text-4xl md:text-6xl xl:text-7xl my-5">
            {username}
          </h1>

          {description && (
            <p className="font-normal text-gray-500 text-sm sm:text-md lg:text-lg mb-6">
              {description.substring(0, 273) + '...'}
            </p>
          )}
          <div className="space-y-5 md:space-x-5">
            <button
              onClick={() => setShowTipModal(true)}
              className="font-semibold text-xl w-full block md:w-1/5 md:inline px-8 py-3 font-medium text-black border-2 border-indigo-800 dark:border-white rounded-md bg-pink-400 hover:bg-pink-600 hover:text-white transiton ease-linear duration-300"
            >
              Tip
            </button>
            <button
              onClick={() => setShowFollowModal(true)}
              className="font-semibold text-xl w-full block md:w-1/5 md:inline px-8 py-3 font-medium text-black border-2 border-indigo-800 dark:border-white rounded-md bg-purple-400 hover:bg-purple-800 hover:text-white transiton ease-linear duration-300"
            >
              Follow
            </button>
          </div>
          {/* <span className="font-normal text-gray-500 text-sm">I am currently open for part-time work.</span> */}
        </div>
        <div className="flex items-center w-11/12 relative mx-auto lg:mx-0 transform duration-500 hover:shadow-2xl cursor-pointer hover:scale-[1.05]">
          <Image
            src={avatar_url}
            layout="fill"
            alt={username}
            className="rounded-lg object-cover object-top"
          />
        </div>
      </header>
      <hr className="text-pink-500 m-5 md:mx-0" />

      <PostGrid posts={postsData?.posts} creatorId={id} setShow={setShowFollowModal} />

      {postsData?.posts?.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="all posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
