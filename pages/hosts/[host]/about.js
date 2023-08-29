// import { MDXLayoutRenderer } from '@/components/MDXComponents'
// import { getFileBySlug } from '@/lib/mdx'

const DEFAULT_LAYOUT = 'AuthorLayout'

// export async function getStaticPaths() {
//   return {
//     paths: [],
//     fallback: 'blocking',
//   }
// }

// export async function getStaticProps() {
// 	const authorDetails = await getFileBySlug('authors', ['default'])
// 	return { props: { authorDetails } }
// }

export default function About({ authorDetails = 'About Page WIP' }) {
  // const { mdxSource, frontMatter } = authorDetails

  return (
    // <MDXLayoutRenderer
    // 	layout={frontMatter.layout || DEFAULT_LAYOUT}
    // 	mdxSource={mdxSource}
    // 	frontMatter={frontMatter}
    // />
    <div>{authorDetails}</div>
  )
}
