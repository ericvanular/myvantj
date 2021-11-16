import React, { useState, useEffect, useRef } from 'react'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import PostGrid from '@/components/PostGrid'
import FollowModal from '@/components/FollowModal'
import TipModal from '@/components/TipModal'
import siteMetadata from '@/data/siteMetadata'
import getCookie from '@/lib/utils/getCookie'
import API from '@/lib/api'

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
  //const postsData = await API(`https://app.jetpeak.co/app/api/creator/posts/eric`)
  const profileData = await API(`https://app.jetpeak.co/app/api/creator/${host.split('.')[0]}`)

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
    `http://localhost:5000/app/api/creator/posts/${host.split('.')[0]}`,
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
      url: `http://localhost:5000/app/api/creator/${host}`,
    }
    API(options)
      .then((data) => setCreator(data.creator))
      .catch(() => setRedirect(true))
  }

  const getPosts = (page) => {
    const options = {
      method: 'get',
      url: username
        ? `/app/api/creator/posts/${username}?page=${page}`
        : `/app/api/creator/posts?page=${page}`,
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
      url: '/api/subscription/payment_method',
    }
    API(options).then((data) => setPaymentMethods(data.payment_methods))
  }

  const { data: paymentMethodsData, error: paymentMethodsError } = useSWR(
    keycloak?.token
      ? [`http://localhost:5000/api/subscription/payment_method`, keycloak?.token]
      : null,
    fetchWithToken
  )

  const { data: postsData, error: postsError } = useSWR(
    [`http://localhost:5000/app/api/creator/posts/${host.split('.')[0]}`, keycloak?.token],
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
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {username}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{description}</p>
          <div className="flex flex-row items-start justify-start">
            <button
              onClick={() => setShowFollowModal(true)}
              className="bg-transparent hover:bg-indigo-600 text-indigo-700 font-semibold hover:text-white py-2 px-4 mx-2 border border-indigo-800 hover:border-transparent rounded"
            >
              Follow
            </button>
            <button
              onClick={() => setShowTipModal(true)}
              className="bg-transparent hover:bg-green-600 text-indigo-700 font-semibold hover:text-white py-2 px-4 mx-2 border border-green-800 hover:border-transparent rounded"
            >
              Tip
            </button>
            {/*
                        <Link
                            href={`/chat`}
                            className="bg-transparent hover:bg-pink-600 text-indigo-700 font-semibold hover:text-white py-2 px-4 mx-2 border border-pink-800 hover:border-transparent rounded"
                        >
                            Chat
                        </Link>
                        */}
          </div>
        </div>
        <PostGrid posts={postsData?.posts} creatorId={id} setShow={setShowFollowModal} />
      </div>
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
