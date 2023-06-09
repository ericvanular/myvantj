import React, { useState, useEffect } from 'react'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import Navatar from './Navatar'
import RegisterModal from './RegisterModal'

import useSWR from 'swr'

import { useRouter } from 'next/router'

const LayoutWrapper = ({ children }) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const router = useRouter()

  return (
    <SectionContainer>
      <RegisterModal open={showRegisterModal} setOpen={setShowRegisterModal} />
      <div className="flex flex-col justify-between">
        <header className="flex items-center justify-between py-10">
          <div>
            <Link href="/" aria-label="Tailwind CSS Blog">
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  {/* data?.creator?.banner_url ? (
                    <img
                      className="hidden sm:block h-20 w-48 shadow-lg rounded object-cover object-center"
                      src={data?.creator?.banner_url}
                      alt={data?.creator?.username}
                    />
                  ) : ( 
                  */}
                </div>
                {router?.query?.host ? (
                  <div className="hidden md:block text-lg sm:text-2xl font-semibold dark:text-gray-100 text-indigo-900 hover:text-black">
                    {router?.query.host}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center text-base leading-5">
            {/*
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
            */}
            <ThemeSwitch />
            <Navatar setShowRegisterModal={setShowRegisterModal} />
            {/* <MobileNav /> */}
          </div>
        </header>
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
