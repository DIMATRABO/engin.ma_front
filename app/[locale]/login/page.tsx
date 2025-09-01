'use client'

import React from 'react'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useLocale, useTranslations} from 'next-intl'
import {useRouter, useSearchParams} from 'next/navigation'

const schema = z.object({
    username_or_email: z.string().min(3, 'Please enter your email or username'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
    const locale = useLocale()
    const t = useTranslations('admin.login')
    const router = useRouter()
    const search = useSearchParams()
    const redirectTo = search.get('redirect') || `/${locale}/admin/`

    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {username_or_email: '', password: ''},
    })

    const [error, setError] = React.useState<string | null>(null)

    async function onSubmit(values: FormValues) {
        setError(null)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(values),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data?.ok) {
                setError((data && data.message) || t('invalid'))
                return
            }
            // Blur inputs to prevent autofill overlay scripts from racing during unmount
            try {
                const active = document.activeElement as HTMLElement | null
                active?.blur?.()
                document.querySelectorAll('input').forEach((el) => (el as HTMLInputElement).blur())
            } catch {
            }
            // Navigate after a frame to let overlays settle
            requestAnimationFrame(() => router.replace(redirectTo))
        } catch {
            setError(t('genericError'))
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div
                className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl text-white">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold">{t('title')}</h1>
                    <p className="text-sm text-white/80 mt-1">{t('subtitle')}</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                    <div>
                        <label htmlFor="username_or_email" className="block text-sm mb-1">{t('usernameOrEmail')}</label>
                        <input
                            id="username_or_email"
                            type="text"
                            className="w-full px-3 py-2 rounded-md bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            {...register('username_or_email')}
                            autoComplete="username"
                        />
                        {errors.username_or_email && (
                            <p className="text-red-300 text-sm mt-1">{errors.username_or_email.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm mb-1">{t('password')}</label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-3 py-2 rounded-md bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            {...register('password')}
                            autoComplete="current-password"
                        />
                        {errors.password && (
                            <p className="text-red-300 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    {error && (
                        <div className="text-red-300 text-sm">{error}</div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-md transition"
                    >
                        {isSubmitting ? t('signingIn') : t('signIn')}
                    </button>
                </form>
            </div>
        </div>
    )
}
