import {NextRequest} from 'next/server'
import {forwardJson} from '@/app/api/_lib/proxy'

export async function DELETE(req: NextRequest) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        body = undefined
    }
    return forwardJson(req, '/users/delete', {method: 'DELETE', body, requireAuth: true})
}
