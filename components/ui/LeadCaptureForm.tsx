'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const leadSchema = z.object({
  role: z.enum(['owner', 'renter']),
  email: z.string().email('Invalid email address'),
})

type LeadFormData = z.infer<typeof leadSchema>

export default function LeadCaptureForm() {
  const t = useTranslations('marketing.leadCapture')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  })

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // For static export, we'll simulate the API call
      // In a real deployment, this would be replaced with a proper API endpoint
      if (typeof window !== 'undefined') {
        // Only make the API call in the browser environment
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          setSubmitStatus('success')
          reset()
        } else {
          setSubmitStatus('error')
        }
      } else {
        // During static generation, just simulate success
        setSubmitStatus('success')
        reset()
      }
    } catch (error) {
      console.error('Error submitting lead:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="lead-capture" className="py-16 lg:py-24 bg-blue-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-blue-100">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">
                {t('roleLabel')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('role')}
                    type="radio"
                    value="owner"
                    className="mr-3 text-blue-600"
                  />
                  <span>{t('roleOwner')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('role')}
                    type="radio"
                    value="renter"
                    className="mr-3 text-blue-600"
                  />
                  <span>{t('roleRenter')}</span>
                </label>
              </div>
              {errors.role && (
                <p className="text-red-300 text-sm mt-2">Please select a role</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t('emailLabel')}
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {errors.email && (
                <p className="text-red-300 text-sm mt-2">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : t('submitButton')}
            </button>
          </form>

          {submitStatus === 'success' && (
            <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
              {t('successMessage')}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
              {t('errorMessage')}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
