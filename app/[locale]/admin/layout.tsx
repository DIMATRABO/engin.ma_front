"use client"

import React from 'react'
import {useLocale, useTranslations} from 'next-intl'
import {Link, usePathname, useRouter} from '@/i18n/navigation'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

type NavKey = 'dashboard' | 'users' | 'equipments' | 'brands' | 'cities' | 'models' | 'bookings'
const navItems: Array<{ href: () => string; labelKey: NavKey; match: (p: string, loc: string) => boolean }> = [
    {
        href: () => `/admin`,
        labelKey: 'dashboard',
        match: (p: string, loc: string) => p === `/${loc}/admin` || p === `/${loc}/admin/`
    },
    {
        href: () => `/admin/users`,
        labelKey: 'users',
        match: (p: string, loc: string) => p.startsWith(`/${loc}/admin/users`)
    },
    {
        href: () => `/admin/equipments`,
        labelKey: 'equipments',
        match: (p: string, loc: string) => p.startsWith(`/${loc}/admin/equipments`)
    },
    {
        href: () => `/admin/brands`,
        labelKey: 'brands',
        match: (p: string, loc: string) => p.startsWith(`/${loc}/admin/brands`)
    },
    {
        href: () => `/admin/cities`,
        labelKey: 'cities',
        match: (p: string, loc: string) => p.startsWith(`/${loc}/admin/cities`)
    },
    {
        href: () => `/admin/models`,
        labelKey: 'models',
        match: (p: string, loc: string) => p.startsWith(`/${loc}/admin/models`)
    },
    {
        href: () => `/admin/bookings`,
        labelKey: 'bookings',
        match: (p: string, loc: string) => p.startsWith(`/${loc}/admin/bookings`)
    },
]

export default function AdminLayout({children}: { children: React.ReactNode }) {
    const locale = useLocale()
    const tNav = useTranslations('admin.nav')
    const tTopbar = useTranslations('admin.topbar')
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const [loggingOut, setLoggingOut] = React.useState(false)
    const activeItem = React.useMemo(() => navItems.find((i) => i.match(pathname, locale)), [pathname, locale])
    const crumb = activeItem ? tNav(activeItem.labelKey) : tNav('dashboard')

    async function logout() {
        try {
            setLoggingOut(true)
            await fetch('/api/auth/logout', {method: 'POST'})
            router.replace('/login/')
        } finally {
            setLoggingOut(false)
        }
    }

    // Do not render admin shell on the login route
    const normalize = (p: string) => p.replace(/\/+$/, '')
    const isLogin = normalize(pathname) === `/${locale}/admin/login`
    if (isLogin) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={cx(
                    'fixed z-30 inset-y-0 start-0 w-64 bg-white border-e shadow-sm transition-transform lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                )}
                aria-label="Sidebar"
            >
                <div className="h-16 flex items-center px-4 border-b font-semibold">{tTopbar('admin')}</div>
                <nav className="p-2">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const active = item.match(pathname, locale)
                            const href = item.href()
                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cx(
                                            'block rounded-md px-3 py-2 text-sm',
                                            active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                                        )}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        {tNav(item.labelKey)}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Content wrapper */}
            <div className="flex-1 lg:ms-64 min-h-screen flex flex-col">
                {/* Topbar */}
                <header className="h-16 bg-white border-b sticky top-0 z-20 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <button
                            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border hover:bg-slate-50"
                            onClick={() => setSidebarOpen((v) => !v)}
                            aria-label="Toggle navigation"
                            aria-expanded={sidebarOpen}
                        >
                            ☰
                        </button>
                        <div className="text-sm text-slate-500">{tTopbar('admin')} / {crumb}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="search"
                            placeholder={tTopbar('searchPlaceholder')}
                            className="hidden md:block border rounded-md px-3 py-1.5 text-sm"
                            aria-label={tTopbar('searchPlaceholder')}
                        />
                        <LanguageSwitcher inline/>
                        <button
                            onClick={logout}
                            disabled={loggingOut}
                            className="inline-flex items-center rounded-md bg-slate-900 text-white text-sm px-3 py-1.5 disabled:opacity-50"
                        >
                            {loggingOut ? tTopbar('loggingOut') : tTopbar('logout')}
                        </button>
                    </div>
                </header>

                {/* Main content */}
                <main className="p-4">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
