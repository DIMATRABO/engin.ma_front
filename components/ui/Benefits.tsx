'use client'

import { useTranslations } from 'next-intl'

export default function Benefits() {
  const t = useTranslations('benefits')

  const benefits = [
    {
      title: t('verifiedMachines.title'),
      description: t('verifiedMachines.description'),
    },
    {
      title: t('nationwideCoverage.title'),
      description: t('nationwideCoverage.description'),
    },
    {
      title: t('flexibleBooking.title'),
      description: t('flexibleBooking.description'),
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="section-title">{t('title')}</h2>
        <p className="section-subtitle mb-12">{t('subtitle')}</p>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
