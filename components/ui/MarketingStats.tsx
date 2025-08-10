'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function MarketingStats() {
  const t = useTranslations('marketing.stats')
  const [counters, setCounters] = useState({ machines: 0, cities: 0, users: 0 })

  useEffect(() => {
    const finalValues = { machines: 2500, cities: 45, users: 15000 }
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepTime = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setCounters({
        machines: Math.floor(finalValues.machines * progress),
        cities: Math.floor(finalValues.cities * progress),
        users: Math.floor(finalValues.users * progress),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setCounters(finalValues)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [])

  const stats = [
    {
      value: counters.machines.toLocaleString(),
      label: t('machines'),
      suffix: '+',
    },
    {
      value: counters.cities.toLocaleString(),
      label: t('cities'),
      suffix: '+',
    },
    {
      value: counters.users.toLocaleString(),
      label: t('users'),
      suffix: '+',
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-xl text-blue-100">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
