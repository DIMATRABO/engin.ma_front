import ContactLanding from '@/components/ui/ContactLanding';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [
    { locale: 'ar' },
    { locale: 'en' },
    { locale: 'fr' },
  ]
}

export default async function HomePage() {
  return (
    <div>
      <ContactLanding />
    </div>
  );
}