'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { routing } from '@/i18n/routing'

// This page handles the root redirect for static export
export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to marketing page as the main landing page
    router.replace(`/${routing.defaultLocale}/marketing`)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
