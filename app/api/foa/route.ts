import {NextRequest} from 'next/server'
import {forwardPassthrough} from '@/app/api/_lib/proxy'

export async function GET(req: NextRequest) {
    return forwardPassthrough(req, '/foa', {method: 'GET', requireAuth: true})
}
