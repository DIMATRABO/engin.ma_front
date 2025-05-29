'use client'

import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'

interface Step {
  title: string
  description: string
  icon?: ReactNode
}

interface StepsProps {
  steps: Step[]
}

export default function Steps({ steps }: StepsProps) {
  const t = useTranslations('steps')

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('title')}</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl mb-4">
                {step.icon ?? index + 1}
              </div>
              <h3 className="text-lg font-semibold">{t(`${index}.title`)}</h3>
              <p className="text-sm text-gray-600 mt-2">{t(`${index}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
