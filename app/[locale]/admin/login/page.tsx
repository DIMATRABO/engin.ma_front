import {redirect} from 'next/navigation'

export default async function AdminLoginRedirect({
                                                     params,
                                                     searchParams,
                                                 }: {
    params: Promise<{ locale: string }>
    searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
    const {locale} = await params
    const spObj = (await searchParams) ?? {}
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(spObj)) {
        if (Array.isArray(v)) {
            v.forEach((val) => sp.append(k, val))
        } else if (v != null) {
            sp.set(k, v)
        }
    }
    const qs = sp.toString()
    redirect(`/${locale}/login${qs ? `?${qs}` : ''}`)
}
