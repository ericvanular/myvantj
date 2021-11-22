import { useState, useRef } from 'react'
import formatDate from '@/lib/utils/formatDate'
import generateFileUrl from '@/lib/utils/generateFileUrl'
import Image from './Image'

const PostGrid = ({ posts, creatorId, setShow }) => {
  const textInput = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex flex-wrap -m-4">
      {!posts && <div className="leading-relaxed m-2">Loading posts...</div>}
      {!posts?.length ? (
        <div className="leading-relaxed m-2">No posts found.</div>
      ) : (
        <div className="container mx-auto mt-2">
          {posts
            ?.slice(0, 5)
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
                        <img
                          alt="gallery"
                          className="absolute w-20 h-20 object-cover object-center "
                          src={'/static/images/lock.png'}
                        />
                        <div className="px-8 py-10 relative z-10 w-full h-30 border-4 border-gray-200 bg-white opacity-0 hover:opacity-100">
                          <button
                            className="tracking-widest text-sm title-font font-medium text-indigo-500 mb-1"
                            onClick={() => setShow(true)}
                          >
                            Click to follow
                          </button>
                          <p className="leading-relaxed">Follow to see this post</p>
                        </div>
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
