'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const leadSchema = z.object({
  role: z.enum(['owner', 'renter']),
  email: z.string().email('Invalid email address'),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const t = useTranslations('marketing.leadCapture')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  })

  const selectedRole = watch('role')

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('form')
      reset()
    }
  }, [isOpen, reset])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        console.log('Lead captured:', data)
        setStep('success')
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      console.error('Error submitting lead:', error)
      // For now, still show success in development
      setStep('success')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {step === 'form' ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('modalTitle')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('roleLabel')}
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...register('role')}
                      type="radio"
                      value="owner"
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <span className="font-medium">{t('roleOwner')}</span>
                      <p className="text-sm text-gray-500">{t('roleOwnerDescription')}</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...register('role')}
                      type="radio"
                      value="renter"
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <span className="font-medium">{t('roleRenter')}</span>
                      <p className="text-sm text-gray-500">{t('roleRenterDescription')}</p>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="text-red-600 text-sm mt-2">{t('roleError')}</p>
                )}
              </div>

              {selectedRole && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('emailLabel')}
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-2">{errors.email.message}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedRole}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('submitting')}
                  </>
                ) : (
                  t('submitButton')
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('successTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('successMessage')}
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('closeButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
