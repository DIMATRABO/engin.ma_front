import "../globals.css";
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {Locale, routing} from '@/i18n/routing';
import {getDirection} from '@/i18n/direction';
import LanguageSwitcherWrapper from '@/components/common/LanguageSwitcherWrapper';
import {AppProviders} from '@/components/providers/AppProviders';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
    params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} dir={getDirection(locale)} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <AppProviders>
                <div className="min-h-screen overflow-x-hidden">
                    <LanguageSwitcherWrapper/>
                    {children}
                </div>
            </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}