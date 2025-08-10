'use client'

import { useTranslations } from 'next-intl'

export default function Roadmap() {
  const t = useTranslations('marketing.roadmap')

  return (
    <section id="roadmap" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="relative">
          <ol className="space-y-8">
            <li className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('q3_2025_title')}
                </h3>
                <p className="text-gray-600">
                  {t('q3_2025_description')}
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('q4_2025_title')}
                </h3>
                <p className="text-gray-600">
                  {t('q4_2025_description')}
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('early_2026_title')}
                </h3>
                <p className="text-gray-600">
                  {t('early_2026_description')}
                </p>
              </div>
            </li>
          </ol>

          {/* Timeline line */}
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-blue-200 -z-10"></div>
        </div>
      </div>
    </section>
  )
}
