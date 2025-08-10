'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

export default function WaitlistBanner() {
  const t = useTranslations('marketing.waitlist')
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setWaitlistCount(data.waitlistCount)
      } catch (error) {
        console.error('Error fetching waitlist count:', error)
        setWaitlistCount(0)
      }
    }

    fetchWaitlistCount()
  }, [])

  // Only show banner if count > 0
  if (!waitlistCount || waitlistCount <= 0) {
    return null
  }

  return (
    <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
      <p>
        {t('bannerText', { count: waitlistCount })}
      </p>
    </div>
  )
}
