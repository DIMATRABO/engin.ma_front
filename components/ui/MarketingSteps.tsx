'use client'

import { useTranslations } from 'next-intl'
import { Search, MessageCircle, CreditCard } from 'lucide-react'

export default function MarketingSteps() {
  const t = useTranslations('marketing.steps')

  const steps = [
    {
      icon: Search,
      title: t('search.title'),
      description: t('search.description'),
    },
    {
      icon: MessageCircle,
      title: t('connect.title'),
      description: t('connect.description'),
    },
    {
      icon: CreditCard,
      title: t('transact.title'),
      description: t('transact.description'),
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 transform -translate-y-1/2"></div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6 relative z-10">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
