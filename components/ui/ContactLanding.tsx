'use client'

import React from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import GlobeIcon from '@/public/globe.svg';
import Image from 'next/image';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {http} from '@/services/http';
import {getApiBaseUrl} from '@/lib/env';

// Define the form schema with Zod
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactLanding() {
  const tLeft = useTranslations('contactLanding.left');
  const tRight = useTranslations('contactLanding.right');
  // Language names in their original language
  const languageNames: Record<string, string> = {
    ar: 'العربية',
    fr: 'Français',
    en: 'English',
  };


  // Show languages in the order: Arabic, French, English
  const availableLocales = ['ar', 'fr', 'en'];

  // Dropdown state
  const [showDropdown, setShowDropdown] = React.useState(false);
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const router = useRouter();
  const pathname = usePathname();
  // removed duplicate declaration

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const base = getApiBaseUrl() ?? 'https://api.enginchantier.ma';
      const res = await http.post<{ success?: boolean; message?: string }>('/contact', data, {
        baseUrlOverride: base,
      });

      console.log('Contact form submitted successfully:', res.data);

      // Reset form after successful submission
      reset();

      // Show success message
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (show error message to user)
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <section
      dir={dir}
      className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white overflow-hidden flex flex-col lg:flex-row"
    >
      {/* Language Switcher Dropdown */}
      <div
        className={`absolute top-4 z-20 flex gap-2 items-center ${dir === 'rtl' ? 'right-4' : 'left-4'}`}
      >
        <div className="relative">
          <button
            type="button"
            aria-label="Change language"
            className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-white/10 hover:bg-white/20 border border-white/30 focus:outline-none"
            onClick={() => setShowDropdown((v) => !v)}
            tabIndex={0}
          >
            <Image src={GlobeIcon} alt="Languages" width={22} height={22} />
          </button>
          {showDropdown && (
            <div className={`absolute mt-2 ${dir === 'rtl' ? 'right-0' : 'left-0'} bg-white text-gray-900 rounded shadow-lg min-w-[120px] border border-gray-200 overflow-hidden z-50`}>
              {availableLocales.map((loc: string) => (
                <button
                  key={loc}
                  onClick={() => {
                    setShowDropdown(false);
                    router.replace(pathname, { locale: loc });
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-100 ${locale === loc ? 'font-bold bg-blue-50' : ''}`}
                  aria-current={locale === loc ? 'page' : undefined}
                >
                  {languageNames[loc]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
  {/* Left: Welcome Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none">
          <Image
            src="/images/backhoe.webp"
            alt={tLeft('title')}
            fill
            style={{ objectFit: 'contain', opacity: 0.3 }}
            className="z-0 rounded-2xl"
            priority
          />
        </div>
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {tLeft('title')}
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-blue-100 max-w-3xl mx-auto">
            {tLeft('subtitle')}
          </p>
        </div>
      </div>

      {/* Right: Contact Form */}
      <div className="flex-1 flex items-center justify-center lg:h-screen relative">
        <div className="w-full h-full flex items-center justify-center">
          <form 
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white bg-opacity-10 backdrop-blur-lg border border-white/20 p-8 lg:p-16 flex flex-col justify-center gap-8 lg:gap-10 items-center w-full max-w-3xl py-16 lg:py-24"
          >
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4 lg:mb-6 text-white">
              {tRight('title')}
            </h2>
            
            <div className="w-full">
              <input
                {...register('name')}
                type="text"
                placeholder={tRight('namePlaceholder')}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 rounded-lg bg-white bg-opacity-80 text-gray-900 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.name && (
                <p className="text-red-300 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="w-full">
              <input
                {...register('email')}
                type="email"
                placeholder={tRight('emailPlaceholder')}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 rounded-lg bg-white bg-opacity-80 text-gray-900 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="w-full">
              <input
                {...register('phone')}
                type="text"
                inputMode='tel'
                placeholder={tRight('phonePlaceholder')}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 rounded-lg bg-white bg-opacity-80 text-gray-900 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.phone && (
                <p className="text-red-300 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="w-full">
              <textarea
                {...register('message')}
                placeholder={tRight('messagePlaceholder')}
                rows={6}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 rounded-lg bg-white bg-opacity-80 text-gray-900 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.message && (
                <p className="text-red-300 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            <p dir={dir} className="w-full text-sm text-white/80">{tRight('messageHelper')}</p>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:scale-105 transform text-white font-bold py-3 lg:py-4 px-6 lg:px-10 rounded-lg text-base lg:text-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? 'Sending...' : tRight('submit')}
            </button>
          </form>
        </div>
        <a
          href={`https://wa.me/212646737878`}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp"
          className={'absolute bottom-6 bg-green-500 hover:bg-green-600 p-5 rounded-full shadow-lg animate-bounce ' + (dir === 'ltr' ? 'right-6' : 'left-6')}
        >
          <Image
            src="/icons/whatsapp.svg"
            alt="WhatsApp"
            width={32}
            height={32}
          />
        </a>
      </div>
    </section>
  );
}
