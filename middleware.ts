import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './next-intl.config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
