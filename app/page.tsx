import {redirect} from 'next/navigation'
import {routing} from '@/i18n/routing'

// Server-side redirect to the default locale marketing page for best performance
export default function RootPage() {
    redirect(`/${routing.defaultLocale}/`)
}
