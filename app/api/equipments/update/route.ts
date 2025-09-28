import {NextRequest} from 'next/server'
import {forwardJson} from '@/app/api/_lib/proxy'

export async function PUT(req: NextRequest) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        body = undefined
    }
    return forwardJson(req, '/equipments/update', {method: 'PUT', body, requireAuth: true})
}
