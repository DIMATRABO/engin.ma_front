'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import LeadCaptureModal from './LeadCaptureModal'

export default function MarketingHero() {
  const t = useTranslations('marketing.hero')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const scrollToForm = () => {
    const formElement = document.getElementById('lead-capture')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToRoadmap = () => {
    const roadmapElement = document.getElementById('roadmap')
    if (roadmapElement) {
      roadmapElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t('cta')}
              </button>
              <button
                onClick={scrollToRoadmap}
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                {t('secondaryCta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
