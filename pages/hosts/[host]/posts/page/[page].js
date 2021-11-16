import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import ListLayout from '@/layouts/ListLayout'
import { POSTS_PER_PAGE } from '..'

export async function getStaticPaths() {
	return {
		paths: [],
		fallback: 'blocking',
	}
}

export async function getStaticProps(context) {
	const {
		params: { page },
	} = context
	const posts = await getAllFilesFrontMatter('blog')
	const pageNumber = parseInt(page)
	const initialDisplayPosts = posts.slice(
		POSTS_PER_PAGE * (pageNumber - 1),
		POSTS_PER_PAGE * pageNumber
	)
	const pagination = {
		currentPage: pageNumber,
		totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
	}

	return {
		props: {
			posts,
			initialDisplayPosts,
			pagination,
		},
	}
}

export default function PostPage({ posts, initialDisplayPosts, pagination }) {
	return (
		<>
			<PageSEO title={siteMetadata.title} description={siteMetadata.description} />
			<ListLayout
				posts={posts}
				initialDisplayPosts={initialDisplayPosts}
				pagination={pagination}
				title="All Posts"
			/>
		</>
	)
}
