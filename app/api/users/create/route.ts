import {NextRequest} from 'next/server'
import {forwardJson} from '@/app/api/_lib/proxy'

export async function POST(req: NextRequest) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        body = undefined
    }
    // Forward to upstream /users/create with Authorization from cookie (requireAuth)
    return forwardJson(req, '/users/create', {method: 'POST', body, requireAuth: true})
}
