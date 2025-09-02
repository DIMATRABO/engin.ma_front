import createMiddleware from 'next-intl/middleware';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {routing} from './i18n/routing';

const intl = createMiddleware({
  ...routing,
    localeDetection: false, // Disable automatic locale detection to always use default
});

function isAdminPath(pathname: string): boolean {
    // Expect paths like /ar/admin..., /fr/admin..., /en/admin...
    // routing.locales contains valid locales
    const locales: readonly string[] = routing.locales ?? [];
    for (const loc of locales) {
        if (pathname === `/${loc}/admin` || pathname.startsWith(`/${loc}/admin/`)) {
            return true;
        }
    }
    return false;
}

function getLocaleFromPath(pathname: string): string | null {
    const locales: readonly string[] = routing.locales ?? [];
    for (const loc of locales) {
        if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
            return loc;
        }
    }
    return null;
}

export default function middleware(req: NextRequest) {
    // First run next-intl middleware to handle locale routing
    const res = intl(req);

    const {nextUrl, cookies} = req;
    const {pathname} = nextUrl;

    if (!isAdminPath(pathname)) {
        return res;
    }

    const locale = getLocaleFromPath(pathname) || routing.defaultLocale;
    const token = cookies.get('accessToken')?.value;

    // Normalize paths by removing any trailing slashes for comparison
    const normalize = (p: string) => p.replace(/\/+$/, '');
    const pathNoSlash = normalize(pathname);
    const loginPath = `/${locale}/login`;
    const adminHomePath = `/${locale}/admin`;
    const isLogin = pathNoSlash === normalize(loginPath);

    // If trying to access admin routes without token, redirect to login (with trailing slash to match Next config)
    if (!token && !isLogin) {
        const url = req.nextUrl.clone();
        url.pathname = `${loginPath}/`;
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // If already authenticated and on login page, redirect to admin home (with trailing slash)
    if (token && isLogin) {
        const url = req.nextUrl.clone();
        url.pathname = `${adminHomePath}/`;
        return NextResponse.redirect(url);
    }

    return res;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};