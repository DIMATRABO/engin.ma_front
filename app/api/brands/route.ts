import {NextRequest, NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/lib/env'

function getLocaleFromRequest(rq: NextRequest): string | undefined {
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

async function forward(rq: NextRequest, method: 'GET' | 'POST') {
    const base = getApiBaseUrl()
    if (!base) return NextResponse.json({message: 'API base URL is not configured'}, {status: 500})

    const token = rq.cookies.get('accessToken')?.value
    const acceptLang = getLocaleFromRequest(rq)

    let body: unknown
    if (method !== 'GET') {
        try {
            body = await rq.json()
        } catch {
            body = undefined
        }
    }

    const headers: Record<string, string> = {
        ...(method !== 'GET' ? {'Content-Type': 'application/json'} : {}),
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
        ...(acceptLang ? {'Accept-Language': acceptLang} : {}),
    }

    const res = await fetch(`${base}/brands`, {
        method,
        headers,
        body: method !== 'GET' && body != null ? JSON.stringify(body) : undefined,
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

    return isJson
        ? NextResponse.json(data)
        : new NextResponse(String(data), {headers: {'content-type': contentType || 'text/plain'}})
}

export async function GET(req: NextRequest) {
    // GET brands may not require auth, but include token if present
    return forward(req, 'GET')
}

export async function POST(req: NextRequest) {
    // POST brands requires auth
    const token = req.cookies.get('accessToken')?.value
    if (!token) return NextResponse.json({message: 'Unauthorized'}, {status: 401})
    return forward(req, 'POST')
}
