import { useState, useRef, useEffect } from 'react'
import formatDate from '@/lib/utils/formatDate'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import generateFileUrl from '@/lib/utils/generateFileUrl'
import Image from './Image'
import VideoPlayer from './VideoPlayer'
import Lightbox from 'lightbox-react'
import 'lightbox-react/style.css'
// import Lightbox from 'react-image-lightbox'
// import 'react-image-lightbox/style.css'

import useSWR from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'

const PostGrid = ({ host, creatorId, pageIndex, setShow, setPageIndex }) => {
  const textInput = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentImage, setCurrentImage] = useState('')
  const [viewerIsOpen, setViewerIsOpen] = useState(false)

  const { data: session, status } = useSession()

  const { data: postsData, error: postsError } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_API}/api/creator/posts/${host.split('.')[0]}?page=${pageIndex}`,
      'GET',
      session?.accessToken,
    ],
    fetchWithToken
  )

  const posts = postsData?.posts

  const openLightbox = (fileSrc) => {
    setCurrentImage(fileSrc)
    setViewerIsOpen(true)
  }

  const closeLightbox = () => {
    setViewerIsOpen(false)
    setCurrentImage('')
  }

  const videoJsOptions = (src, type) => {
    return {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [
        {
          src: src,
        },
      ],
    }
  }

  const handlePlayerReady = (player) => {
    player.on('click', () => {
      if (!player.isFullscreen()) {
        player.requestFullscreen()
      }
    })
  }

  return (
    <>
      <div className={`max-w-full my-2 flex flex-wrap flex-row ${!posts?.length ? 'hidden' : ''}`}>
        {!posts && <div className="leading-relaxed m-2">Loading posts...</div>}
        {posts?.length &&
          posts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((post) => {
              return (
                <div key={post.id} className="p-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 hover:shadow-l">
                  <div className="w-full h-60 relative overflow-hidden border-2 border-gray-200 rounded-lg border-opacity-60 dark:border-gray-700 transform duration-500 hover:shadow-2xl cursor-pointer hover:scale-[1.01]">
                    {post.files ? (
                      <>
                        {post.files[0].mime_type.match('video.*') ? (
                          <VideoPlayer
                            options={videoJsOptions(
                              generateFileUrl(creatorId, post.files[0].file_name),
                              post.files[0].mime_type
                            )}
                            onReady={handlePlayerReady}
                          />
                        ) : (
                          <Image
                            alt={post.description}
                            src={generateFileUrl(creatorId, post.files[0].file_name)}
                            className="object-cover object-top"
                            layout="fill"
                            onMouseDown={() =>
                              openLightbox(generateFileUrl(creatorId, post.files[0].file_name))
                            }
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex justify-center items-center p-4 w-full h-60 bg-gradient-to-tr from-indigo-100 via-pink-200 to-purple-300 background-animate">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="text-gray-900 absolute w-40 h-40 object-cover object-center"
                        >
                          <path d="M14,15c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S14,13.9,14,15z" />
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeMiterlimit="10"
                            strokeWidth="2"
                            d="M17 9c0 0 0-1.6 0-2 0-2.8-2.2-5-5-5S7 4.2 7 7c0 .4 0 2 0 2M18 21H6c-.552 0-1-.448-1-1V10c0-.552.448-1 1-1h12c.552 0 1 .448 1 1v10C19 20.552 18.552 21 18 21z"
                          />
                        </svg>
                        <button
                          className="rounded relative z-10 w-full h-full opacity-0 hover:opacity-100 cursor-pointer flex flex-row items-center justify-center"
                          onClick={() => setShow(true)}
                        >
                          <div className="inline-flex items-center leading-none bg-indigo-50 rounded-full p-2 shadow text-black text-4xl border border-gray-400">
                            <span className="inline-flex bg-black text-white rounded-full p-4 justify-center items-center font-semibold">
                              FOLLOW
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        {viewerIsOpen && (
          <Lightbox
            mainSrc={currentImage}
            nextSrc={null}
            prevSrc={null}
            onCloseRequest={closeLightbox}
            onMovePrevRequest={null}
            onMoveNextRequest={null}
            discourageDownloads={false}
            clickOutsideToClose={true}
            animationDuration={100}
            // imageTitle={creator.username}
          />
        )}
      </div>
      <div className="flex justify-between mt-8">
        <div
          className={`flex justify-start text-lg font-medium leading-6 ${
            !postsData?.prev_num ? 'invisible' : ''
          }`}
        >
          <div
            disabled={!postsData?.next_num}
            id="next-page"
            onClick={() => setPageIndex(pageIndex - 1)}
            className="text-primary-500 hover:text-primary-800 dark:hover:text-primary-400 cursor-pointer"
            aria-label="all posts"
          >
            &larr; Previous Page
          </div>
        </div>
        <div
          className={`flex justify-end text-lg font-medium leading-6 ${
            !postsData?.next_num ? 'invisible' : ''
          }`}
        >
          <div
            disabled={!postsData?.next_num}
            id="next-page"
            onClick={() => setPageIndex(pageIndex + 1)}
            className="text-primary-500 hover:text-primary-800 dark:hover:text-primary-400 cursor-pointer"
            aria-label="all posts"
          >
            Next Page &rarr;
          </div>
        </div>
      </div>
    </>
  )
}

export default PostGrid
