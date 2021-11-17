import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import Navatar from './Navatar'

import useSWR from 'swr'

import { useRouter } from 'next/router'

const LayoutWrapper = ({ children }) => {
  const router = useRouter()

  const fetcher = async (url) => {
    const res = await fetch(url)
    return res.json()
  }

  const { data: creator, error } = useSWR(
    `http://localhost:5000/app/api/creator/${router?.query.host?.split('.')[0]}`,
    fetcher
  )

  return (
    <SectionContainer>
      <div className="flex flex-col justify-between h-screen">
        <header className="flex items-center justify-between py-10">
          <div>
            <Link href="/" aria-label="Tailwind CSS Blog">
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  {creator?.avatar_url ? (
                    <img
                      className="h-16 w-20 rounded-full object-cover object-center"
                      src={creator?.avatar_url}
                      alt={creator?.username}
                    />
                  ) : (
                    <img
                      className="mx-auto h-12 w-auto"
                      src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                      alt="Workflow"
                    />
                  )}
                </div>
                {router?.query?.host ? (
                  <div className="hidden text-2xl font-semibold sm:block">
                    {router?.query.host.split('.')[0]}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center text-base leading-5">
            <div className="hidden sm:block">
              {headerNavLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100"
                >
                  {link.title}
                </Link>
              ))}
            </div>
            <ThemeSwitch />
            <Navatar />
            <MobileNav />
          </div>
        </header>
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
