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
        const res = await fetch(`${base}/equipments/filter`, {
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
            // Forward backend error body and content-type transparently so it appears in DevTools
            if (isJson) {
                return NextResponse.json(data as unknown, {status: res.status})
            }
            return new NextResponse(String(data), {
                status: res.status,
                headers: {'content-type': contentType || 'text/plain'}
            })
        }

        // Normalize response to FE shape: { items, total, pageIndex, pageSize }
        try {
            type ReqBody = { pageIndex?: number; pageSize?: number; [k: string]: unknown }
            const rb = (body && typeof body === 'object') ? (body as ReqBody) : undefined
            const reqPageIndex = typeof rb?.pageIndex === 'number' ? rb?.pageIndex : undefined
            const reqPageSize = typeof rb?.pageSize === 'number' ? rb?.pageSize : undefined

            if (data && typeof data === 'object') {
                type BackendResp = {
                    items?: unknown[]
                    total?: number
                    pageIndex?: number
                    pageSize?: number
                    data?: unknown[]
                    [k: string]: unknown
                }
                const obj = data as BackendResp
                const maybeItems = obj.items
                const maybeTotal = obj.total
                const maybeDataArray = obj.data

                if (Array.isArray(maybeItems) && typeof maybeTotal === 'number') {
                    // Already in expected shape; ensure pageIndex/pageSize present
                    const shaped = {
                        items: maybeItems,
                        total: maybeTotal,
                        pageIndex: typeof obj.pageIndex === 'number' ? obj.pageIndex : (reqPageIndex ?? 1),
                        pageSize: typeof obj.pageSize === 'number' ? obj.pageSize : (reqPageSize ?? (Array.isArray(maybeItems) ? maybeItems.length : 0)),
                    }
                    return NextResponse.json(shaped)
                }

                if (Array.isArray(maybeDataArray)) {
                    const totalNum = typeof maybeTotal === 'number' ? maybeTotal : maybeDataArray.length
                    const shaped = {
                        items: maybeDataArray as unknown[],
                        total: totalNum,
                        pageIndex: reqPageIndex ?? 1,
                        pageSize: reqPageSize ?? maybeDataArray.length,
                    }
                    return NextResponse.json(shaped)
                }
            }
        } catch {
            // fall through to return raw data
        }

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({message: 'Unexpected error'}, {status: 500})
    }
}
