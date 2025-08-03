'use client'

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

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
      // Handle form submission here
      console.log('Form data:', data);
      
      // You can add your API call here
      // await submitContactForm(data);
      
      // Reset form after successful submission
      reset();
      
      // You could show a success message here
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
