"use client"

import React from 'react'
import {usePathname} from 'next/navigation'
import {useLocale} from 'next-intl'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

// Renders LanguageSwitcher on all pages except admin routes.
export default function LanguageSwitcherWrapper() {
    const pathname = usePathname()
    const locale = useLocale()

    // Avoid rendering on admin pages to prevent duplication with the admin Topbar switcher
    const isAdmin = pathname.startsWith(`/${locale}/admin`)
    if (isAdmin) return null

    return <LanguageSwitcher/>
}
