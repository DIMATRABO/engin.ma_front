import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import MarketingHero from '@/components/ui/MarketingHero'
import SplitBenefits from '@/components/ui/SplitBenefits'
import MarketingSteps from '@/components/ui/MarketingSteps'
import Roadmap from '@/components/ui/Roadmap'
import FAQ from '@/components/ui/FAQ'
import WaitlistBanner from '@/components/ui/WaitlistBanner'
import LeadCaptureModal from '@/components/ui/LeadCaptureModal'

export const dynamic = 'force-static'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.seo' })

  return {
    title: t('title') + ' - Beta',
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title') + ' - Beta',
      description: t('description'),
      type: 'website',
      locale: locale,
      siteName: 'Engin.ma',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title') + ' - Beta',
      description: t('description'),
    },
    alternates: {
      canonical: `/${locale}/marketing`,
      languages: {
        'en': '/en/marketing',
        'fr': '/fr/marketing',
        'ar': '/ar/marketing',
      },
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Engin.ma',
        applicationCategory: 'Marketplace',
        operatingSystem: 'Web',
        description: t('description'),
        url: `/${locale}/marketing`,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'MAD'
        }
      })
    }
  }
}

export default function MarketingPage() {
  return (
    <main className="min-h-screen">
      <WaitlistBanner />
      <MarketingHero />
      <SplitBenefits />
      <MarketingSteps />
      <Roadmap />
      <FAQ />
      <footer className="bg-gray-100 py-8 text-center text-sm text-gray-600">
        Engin.ma is currently in closed beta; features and timelines may change.
      </footer>
    </main>
  )
}
