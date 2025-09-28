import {NextRequest} from 'next/server'
import {forwardJson, forwardPassthrough} from '@/app/api/_lib/proxy'

export async function GET(req: NextRequest) {
    return forwardPassthrough(req, '/categories', {method: 'GET'})
}

export async function POST(req: NextRequest) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        body = undefined
    }
    return forwardJson(req, '/categories', {method: 'POST', body, requireAuth: true})
}
