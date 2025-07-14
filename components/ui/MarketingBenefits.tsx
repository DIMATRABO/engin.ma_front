'use client'

import { useTranslations } from 'next-intl'
import { DollarSign, TrendingUp, Shield } from 'lucide-react'

export default function MarketingBenefits() {
  const t = useTranslations('marketing.benefits')

  const benefits = [
    {
      icon: DollarSign,
      title: t('lowerCosts.title'),
      description: t('lowerCosts.description'),
    },
    {
      icon: TrendingUp,
      title: t('higherUtilization.title'),
      description: t('higherUtilization.description'),
    },
    {
      icon: Shield,
      title: t('secureEscrow.title'),
      description: t('secureEscrow.description'),
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
