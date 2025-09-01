import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/lib/env'

function extractToken(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') return undefined
    const obj = data as Record<string, unknown>
    return (
        (obj['accessToken'] as string | undefined) ||
        (obj['access_token'] as string | undefined) ||
        (obj['token'] as string | undefined) ||
        (obj['jwt'] as string | undefined) ||
        (obj['access'] as string | undefined)
    )
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const base = getApiBaseUrl()
        if (!base) {
            return NextResponse.json({ok: false, message: 'API base URL is not configured'}, {status: 500})
        }

        const url = `${base}/auth`

        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })

        const contentType = res.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')
        const data: unknown = isJson ? await res.json() : await res.text()

        if (!res.ok) {
            // Forward backend error body and content-type transparently so it appears in DevTools
            if (isJson) {
                return NextResponse.json(data as unknown, {status: res.status})
            }
            return new NextResponse(String(data), {
                status: res.status,
                headers: {'content-type': contentType || 'text/plain'}
            })
        }

        let token = extractToken(data)
        if (!token && typeof data === 'object' && data) {
            // If backend uses nested structure, try common paths
            const obj = data as Record<string, unknown>
            token = extractToken(obj['data']) || extractToken(obj['result'])
        }
        if (!token) {
            return NextResponse.json({ok: false, message: 'No access token in response'}, {status: 500})
        }

        const resp = NextResponse.json({ok: true})
        resp.cookies.set('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60, // 1 hour
        })
        return resp
    } catch {
        return NextResponse.json({ok: false, message: 'Unexpected error'}, {status: 500})
    }
}
