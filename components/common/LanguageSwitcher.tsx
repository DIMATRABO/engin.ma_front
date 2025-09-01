"use client"

import React from 'react'
import Image from 'next/image'
import GlobeIcon from '@/public/globe.svg'
import {useLocale, useTranslations} from 'next-intl'
import {usePathname, useRouter} from '@/i18n/navigation'
import type {Locale} from '@/i18n/routing'

// Language switcher that supports floating (default) and inline variants
export function LanguageSwitcher({inline = false}: { inline?: boolean }) {
    const t = useTranslations('language')
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const isRtl = locale === 'ar'

    const [open, setOpen] = React.useState(false)
    const availableLocales: Array<{ code: Locale; label: string }> = [
        {code: 'ar', label: t('arabic')},
        {code: 'fr', label: t('french')},
        {code: 'en', label: t('english')},
    ]

    React.useEffect(() => {
        function onKeydown(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }

        window.addEventListener('keydown', onKeydown)
        return () => window.removeEventListener('keydown', onKeydown)
    }, [])

    const containerClass = inline ? 'relative' : `fixed top-4 z-50 ${isRtl ? 'right-4' : 'left-4'}`
    const buttonClass = inline
        ? 'inline-flex items-center justify-center h-9 px-3 rounded-md border text-sm hover:bg-slate-50'
        : 'flex items-center justify-center w-10 h-10 text-white rounded-full bg-black/40 hover:bg-black/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/60'

    return (
        <div className={containerClass}>
            <div className="relative">
                <button
                    type="button"
                    aria-label="Change language"
                    className={buttonClass}
                    onClick={() => setOpen((v) => !v)}
                >
                    {inline ? (
                        // In admin (inline), use a vector icon we can color black
                        // eslint-disable-next-line @next/next/no-img-element
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-black"
                            aria-hidden
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path
                                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    ) : (
                        <Image src={GlobeIcon} alt="Languages" width={20} height={20}/>
                    )}
                </button>
                {open && (
                    <div
                        className={`absolute mt-2 min-w-[150px] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg ${
                            isRtl ? 'right-0' : 'left-0'
                        }`}
                        role="menu"
                        aria-label="Select language"
                    >
                        {availableLocales.map((loc) => (
                            <button
                                key={loc.code}
                                onClick={() => {
                                    setOpen(false)
                                    router.replace(pathname, {locale: loc.code})
                                }}
                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-blue-50 ${
                                    locale === loc.code ? 'bg-blue-100 font-semibold' : ''
                                }`}
                                aria-current={locale === loc.code ? 'true' : undefined}
                                role="menuitemradio"
                                aria-checked={locale === loc.code}
                            >
                                {loc.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LanguageSwitcher
