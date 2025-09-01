import {NextRequest, NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/lib/env'

export async function POST(req: NextRequest) {
    const base = getApiBaseUrl()
    if (!base) {
        return NextResponse.json({message: 'API base URL is not configured'}, {status: 500})
    }
    const token = req.cookies.get('accessToken')?.value
    if (!token) {
        return NextResponse.json({message: 'Unauthorized'}, {status: 401})
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        body = undefined
    }

    try {
        const res = await fetch(`${base}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: body != null ? JSON.stringify(body) : undefined,
        })

        const contentType = res.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')
        const data = isJson ? await res.json() : await res.text()

        if (!res.ok) {
            // Forward backend error body and content-type transparently
            if (isJson) {
                return NextResponse.json(data as unknown, {status: res.status})
            }
            return new NextResponse(String(data), {
                status: res.status,
                headers: {'content-type': contentType || 'text/plain'}
            })
        }

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({message: 'Unexpected error'}, {status: 500})
    }
}
