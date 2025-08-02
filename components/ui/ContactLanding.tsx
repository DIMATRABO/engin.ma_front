'use client'

import { useTranslations } from 'next-intl';

export default function ContactLanding() {
  const t = useTranslations('marketing.hero');

  return (
    <>
      <section className="h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden flex items-center justify-center">
        <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
        
        <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
