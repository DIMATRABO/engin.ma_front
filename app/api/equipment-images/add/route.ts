import {NextRequest, NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/lib/env'

export async function POST(req: NextRequest) {
    const base = getApiBaseUrl()
    if (!base) return NextResponse.json({message: 'API base URL is not configured'}, {status: 500})
    const token = req.cookies.get('accessToken')?.value
    if (!token) return NextResponse.json({message: 'Unauthorized'}, {status: 401})

    try {
        const getLocaleFromRequest = (rq: NextRequest): string | undefined => {
            const cookieLoc = rq.cookies.get('NEXT_LOCALE')?.value
            if (cookieLoc) return cookieLoc
            const ref = rq.headers.get('referer')
            try {
                if (ref) {
                    const u = new URL(ref)
                    const seg = u.pathname.split('/').filter(Boolean)[0]
                    if (seg) return seg
                }
            } catch {
            }
            const al = rq.headers.get('accept-language')
            if (al) return al.split(',')[0]?.trim()
            return undefined
        }
        const acceptLang = getLocaleFromRequest(req)
        const form = await req.formData()
        const res = await fetch(`${base}/equipment-images/add`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                ...(acceptLang ? {'Accept-Language': acceptLang} : {}),
                // Do NOT set Content-Type; fetch will set multipart boundary automatically
            } as unknown as HeadersInit,
            body: form as unknown as BodyInit,
        })

        const contentType = res.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')
        const data = isJson ? await res.json() : await res.text()

        if (!res.ok) {
            if (isJson) return NextResponse.json(data as unknown, {status: res.status})
            return new NextResponse(String(data), {
                status: res.status,
                headers: {'content-type': contentType || 'text/plain'}
            })
        }

        return isJson ? NextResponse.json(data) : new NextResponse(String(data), {headers: {'content-type': contentType || 'text/plain'}})
    } catch {
        return NextResponse.json({message: 'Unexpected error'}, {status: 500})
    }
}
