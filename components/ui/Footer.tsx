'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer
      className="bg-gray-900 text-white py-10"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('title')}</h3>
          <p className="text-sm text-gray-400">{t('description')}</p>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-2">{t('quickLinks')}</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white">
                {t('links.home')}
              </Link>
            </li>
            <li>
              <Link href="/machines" className="hover:text-white">
                {t('links.machines')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                {t('links.contact')}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                {t('links.about')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-2">{t('stayConnected')}</h4>
          <p className="text-sm text-gray-400 mb-4">{t('newsletter')}</p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
            >
              {t('subscribe')}
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
