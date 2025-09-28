import {NextRequest} from 'next/server'
import {forwardJson, forwardPassthrough} from '@/app/api/_lib/proxy'

export async function GET(req: NextRequest) {
    return forwardPassthrough(req, '/bookings', {method: 'GET', requireAuth: true})
}

export async function POST(req: NextRequest) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        body = undefined
    }
    return forwardJson(req, '/bookings', {method: 'POST', body, requireAuth: true})
}

export async function PUT(req: NextRequest) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        body = undefined
    }
    return forwardJson(req, '/bookings', {method: 'PUT', body, requireAuth: true})
}
