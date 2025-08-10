'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('menu')
  const tLang = useTranslations('language')
  const pathname = usePathname()
  const router = useRouter()


  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLanguageChange = (lang: string) => {
    const segments = pathname.split('/')
    segments[1] = lang // replace locale segment
    router.push(segments.join('/'))
  }

  const isActive = (href: string) => {
    const currentPath = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    return currentPath === href
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-blue-600">Enginchantier.ma</span>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
              Beta • In Development
            </span>
          </div>

          {/* Hamburger Menu */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href={`/${locale}/`}
              className={`nav-link ${isActive('/') ? 'text-blue-600 font-bold' : ''}`}
            >
              {t('browse')}
            </Link>
            <Link
              href={`/${locale}/how-it-works`}
              className={`nav-link ${isActive('/how-it-works') ? 'text-blue-600 font-bold' : ''}`}
            >
              {t('howItWorks')}
            </Link>
            <a
              href="#roadmap"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                const roadmapElement = document.getElementById('roadmap')
                if (roadmapElement) {
                  roadmapElement.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              {t('roadmap')}
            </a>
            <Link
              href={`/${locale}/list-your-machine`}
              className={`nav-link ${isActive('/list-your-machine') ? 'text-blue-600 font-bold' : ''}`}
            >
              {t('listYourMachine')}
            </Link>

            {/* Language Picker */}
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">{tLang('english')}</option>
              <option value="fr">{tLang('french')}</option>
              <option value="ar">{tLang('arabic')}</option>
            </select>

            <button
              onClick={() => {
                const formElement = document.getElementById('lead-capture')
                if (formElement) {
                  formElement.scrollIntoView({ behavior: 'smooth' })
                } else {
                  router.push(`/${locale}/marketing#lead-capture`)
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('getEarlyAccess')}
            </button>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {t('signIn')}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col space-y-4 mt-4">
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">{tLang('english')}</option>
              <option value="fr">{tLang('french')}</option>
              <option value="ar">{tLang('arabic')}</option>
            </select>

            <Link href={`/${locale}/`} className={`${isActive('/') ? 'text-blue-600 font-bold' : ''}`}>
              {t('browse')}
            </Link>
            <Link
              href={`/${locale}/how-it-works`}
              className={`${isActive('/how-it-works') ? 'text-blue-600 font-bold' : ''}`}
            >
              {t('howItWorks')}
            </Link>
            <Link
              href={`/${locale}/list-your-machine`}
              className={`${isActive('/list-your-machine') ? 'text-blue-600 font-bold' : ''}`}
            >
              {t('listYourMachine')}
            </Link>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {t('signIn')}
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
