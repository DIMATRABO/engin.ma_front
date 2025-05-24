import {ReactNode} from 'react';
import {getMessages} from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';

export default async function LocaleLayout({
  children,
  params: {locale},
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
