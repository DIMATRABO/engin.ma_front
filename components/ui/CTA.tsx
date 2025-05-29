'use client'

import { useTranslations } from 'next-intl'

export default function CTA() {
  const t = useTranslations('cta')

  return (
    <section className="py-20 bg-blue-600 text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          {t('heading')}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg">
            {t('find')}
          </button>
          <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200">
            {t('list')}
          </button>
        </div>
      </div>
    </section>
  )
}
