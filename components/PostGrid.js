import { useState, useRef } from 'react'
import formatDate from '@/lib/utils/formatDate'
import generateFileUrl from '@/lib/utils/generateFileUrl'
import Image from './Image'

const PostGrid = ({ posts, creatorId, setShow }) => {
  const textInput = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  return (
    <div className={`flex flex-wrap -m-4 ${!posts?.length ? 'hidden' : ''}`}>
      {!posts && <div className="leading-relaxed m-2">Loading posts...</div>}
      {!posts?.length ? (
        <div className="leading-relaxed m-2">No posts found.</div>
      ) : (
        <div className="container mx-auto mt-2">
          {posts
            // ?.slice(0, 5)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((post) => {
              return (
                <div key={post.id} className="p-2 w-full hover:shadow-l">
                  <div className="flex justify-center items-center relative">
                    {post.files ? (
                      <>
                        {post.files[0].mime_type.match('video.*') ? (
                          {
                            /*<VideoPlayer className="feed-image ui fluid rounded image" videoSrc={generateFileUrl(creator.id, post.files[0].file_name)} />*/
                          }
                        ) : (
                          <img
                            alt="gallery"
                            className="rounded w-full h-full object-cover object-center border border-gray-400"
                            src={generateFileUrl(creatorId, post.files[0].file_name)}
                          />
                        )}

                        {/*<img className="feed-image ui fluid rounded image" src={generateFileUrl(creator.id, post.files[0].file_name)} onMouseDown={() => openLightbox(generateFileUrl(creator.id, post.files[0].file_name))} />*/}
                      </>
                    ) : (
                      <>
                        {/*<img
                          alt="gallery"
                          className="absolute w-20 h-20 object-cover object-center "
                          src={'/static/images/lock.png'}
                        />*/}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="text-gray-900 dark:text-gray-100 absolute w-28 h-28 object-cover object-center"
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
                          className="rounded px-8 py-10 relative z-10 w-full h-30 bg-white dark:bg-gray-900 opacity-0 hover:opacity-100 cursor-pointer flex flex-row justify-center"
                          onClick={() => setShow(true)}
                        >
                          <div className="inline-flex items-center bg-white leading-none rounded-full p-2 shadow text-black text-xl border border-gray-400">
                            <span className="inline-flex bg-indigo-700 text-white rounded-full h-6 p-4 justify-center items-center font-semibold text-2xl">
                              Follow
                            </span>
                            <span className="inline-flex px-2">Click to see this post</span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default PostGrid
