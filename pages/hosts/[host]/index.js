import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import formatDate from '@/lib/utils/formatDate'
import generateFileUrl from '@/lib/utils/generateFileUrl'
import API from '@/lib/api'

const MAX_DISPLAY = 5

import { useRouter } from 'next/router'

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

export async function getStaticProps(context) {
    const host = context.params.host
    const postsData = await API(`https://app.jetpeak.co/app/api/creator/posts/eric`)
    const profileData = await API(`https://app.jetpeak.co/app/api/creator/${host.split('.')[0]}`)

    if (!profileData.result) {
        return {
            notFound: true,
        }
    }

    const { id, username, description } = profileData.creator
    const { posts } = postsData

    return {
        props: {
            posts,
            host,
            id,
            username,
            description,
        },
        // revalidate: 10,
    }
}

export default function Home({ posts, host, id, username, description }) {
    const router = useRouter()

    // Host available on query from router if blocking or fallback
    const query = router.query

    return (
        <>
            <PageSEO title={host} description={siteMetadata.description} />
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="pt-6 pb-8 space-y-2 md:space-y-5">
                    <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
                        {username}
                    </h1>
                    <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                    <button className="bg-transparent hover:bg-indigo-600 text-indigo-700 font-semibold hover:text-white py-2 px-4 border border-indigo-800 hover:border-transparent rounded">
                        Follow
                    </button>
                </div>
                <div className="flex flex-wrap -m-4">
                    {!posts.length && 'No posts found.'}
                    {posts
                        .slice(0, MAX_DISPLAY)
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((post) => {
                            return (
                                <div key={post.id} className="lg:w-1/3 sm:w-1/2 p-4">
                                    <div className="flex relative">
                                        <img
                                            alt="gallery"
                                            className="absolute inset-0 w-full h-full object-cover object-center"
                                            src={generateFileUrl(id, post.files[0].file_name)}
                                        />
                                        <div className="px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100">
                                            <h2 className="tracking-widest text-sm title-font font-medium text-indigo-500 mb-1">
                                                {formatDate(post.timestamp)}
                                            </h2>
                                            <p className="leading-relaxed">{post.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>

            {posts.length > MAX_DISPLAY && (
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
