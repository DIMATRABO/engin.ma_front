import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/lib/env'

export function getAcceptLanguageFromRequest(req: NextRequest): string | undefined {
    const cookieLoc = req.cookies.get('NEXT_LOCALE')?.value
    if (cookieLoc) return cookieLoc
    const ref = req.headers.get('referer')
    try {
        if (ref) {
            const u = new URL(ref)
            const seg = u.pathname.split('/').filter(Boolean)[0]
            if (seg) return seg
        }
    } catch {
    }
    const al = req.headers.get('accept-language')
    if (al) return al.split(',')[0]?.trim()
    return undefined
}

export function getApiBaseOrError(): string | null {
    const base = getApiBaseUrl()
    if (!base) return null
    return base
}

export function getAuthToken(req: NextRequest): string | undefined {
    return req.cookies.get('accessToken')?.value
}

export async function forwardJson(
    req: NextRequest,
    upstreamPath: string,
    init: {
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?: unknown;
        requireAuth?: boolean;
        headers?: Record<string, string>
    }
) {
    const base = getApiBaseOrError()
    if (!base) return NextResponse.json({message: 'API base URL is not configured'}, {status: 500})

    const token = getAuthToken(req)
    if (init.requireAuth && !token) return NextResponse.json({message: 'Unauthorized'}, {status: 401})

    const acceptLang = getAcceptLanguageFromRequest(req)
    const res = await fetch(`${base}${upstreamPath.startsWith('/') ? '' : '/'}${upstreamPath}`, {
        method: init.method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(acceptLang ? {'Accept-Language': acceptLang} : {}),
            ...(init.headers || {}),
        },
        body: init.body != null ? JSON.stringify(init.body) : undefined,
    })
    return passThrough(res)
}

export async function forwardPassthrough(
    req: NextRequest,
    upstreamPath: string,
    init: { method: 'GET' | 'DELETE'; requireAuth?: boolean; headers?: Record<string, string> }
) {
    const base = getApiBaseOrError()
    if (!base) return NextResponse.json({message: 'API base URL is not configured'}, {status: 500})

    const token = getAuthToken(req)
    if (init.requireAuth && !token) return NextResponse.json({message: 'Unauthorized'}, {status: 401})

    const acceptLang = getAcceptLanguageFromRequest(req)
    const res = await fetch(`${base}${upstreamPath.startsWith('/') ? '' : '/'}${upstreamPath}`, {
        method: init.method,
        headers: {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(acceptLang ? {'Accept-Language': acceptLang} : {}),
            ...(init.headers || {}),
        },
    })
    return passThrough(res)
}

export async function forwardFormData(
    req: NextRequest,
    upstreamPath: string,
    init: {
        method: 'POST' | 'PUT' | 'PATCH';
        formData: FormData;
        requireAuth?: boolean;
        headers?: Record<string, string>
    }
) {
    const base = getApiBaseOrError()
    if (!base) return NextResponse.json({message: 'API base URL is not configured'}, {status: 500})

    const token = getAuthToken(req)
    if (init.requireAuth && !token) return NextResponse.json({message: 'Unauthorized'}, {status: 401})

    const acceptLang = getAcceptLanguageFromRequest(req)
    const res = await fetch(`${base}${upstreamPath.startsWith('/') ? '' : '/'}${upstreamPath}`, {
        method: init.method,
        headers: {
            // Do not set Content-Type; let runtime set multipart boundaries
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(acceptLang ? {'Accept-Language': acceptLang} : {}),
            ...(init.headers || {}),
        },
        body: init.formData,
    })
    return passThrough(res)
}

export async function passThrough(res: Response) {
    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    try {
        if (!res.ok) {
            if (isJson) {
                const data = await res.json()
                return NextResponse.json(data as unknown, {status: res.status})
            } else {
                const text = await res.text()
                return new NextResponse(text, {
                    status: res.status,
                    headers: {'content-type': contentType || 'text/plain'}
                })
            }
        }
        if (isJson) {
            const data = await res.json()
            return NextResponse.json(data)
        }
        const buf = await res.arrayBuffer()
        const headers = new Headers()
        if (contentType) headers.set('content-type', contentType)
        return new NextResponse(buf, {status: res.status, headers})
    } catch {
        return NextResponse.json({message: 'Unexpected error'}, {status: 500})
    }
}
