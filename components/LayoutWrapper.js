import React, { useState, useEffect, useContext } from 'react'
import { SiteContext } from 'pages/_app'
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
import { HomeIcon } from '@heroicons/react/24/outline'

const LayoutWrapper = ({ children }) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const { partyData } = useContext(SiteContext)

  return (
    <SectionContainer>
      <RegisterModal open={showRegisterModal} setOpen={setShowRegisterModal} />
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between py-6">
          <div>
            <Link href="/" aria-label="Vantj">
              <div className="flex items-center justify-between">
                <HomeIcon className="h-8 w-8" />
                {/* { partyData?.avatar_url &&
                  <div className="mr-3">
                    <img
                      className="h-12 w-12 rounded-full object-cover object-center"
                      src={partyData.avatar_url}
                      alt={partyData.name}
                    />
                  </div>
                }
                { partyData?.domain &&
                  <div className="hidden md:block text-lg sm:text-xl font-semibold dark:text-gray-100 text-indigo-900 hover:text-black">
                    {partyData?.domain}
                  </div>
                } */}
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
