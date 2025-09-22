import {NextRequest, NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/lib/env'

export async function GET(req: NextRequest, {params}: { params: Promise<{ filename: string }> }) {
    const base = getApiBaseUrl()
    if (!base) return NextResponse.json({message: 'API base URL is not configured'}, {status: 500})
    const token = req.cookies.get('accessToken')?.value
    if (!token) return NextResponse.json({message: 'Unauthorized'}, {status: 401})

    const {filename} = await params
    if (!filename) return NextResponse.json({message: 'Missing filename'}, {status: 400})

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
        const res = await fetch(`${base}/equipment-images/${encodeURIComponent(filename)}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                ...(acceptLang ? {'Accept-Language': acceptLang} : {}),
            },
        })

        const contentType = res.headers.get('content-type') || ''
        const arrayBuffer = await res.arrayBuffer()

        if (!res.ok) {
            return new NextResponse(arrayBuffer, {
                status: res.status,
                headers: {'content-type': contentType || 'application/octet-stream'},
            })
        }

        return new NextResponse(arrayBuffer, {
            status: res.status,
            headers: {'content-type': contentType || 'application/octet-stream'},
        })
    } catch {
        return NextResponse.json({message: 'Unexpected error'}, {status: 500})
    }
}
