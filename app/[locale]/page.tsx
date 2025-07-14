import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('about')}</p>
    </div>
  );
}