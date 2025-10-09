import {NextRequest} from 'next/server'
import {forwardJson, forwardPassthrough} from '@/app/api/_lib/proxy'

export async function GET(req: NextRequest) {
    return forwardPassthrough(req, '/cities', {method: 'GET', requireAuth: true})
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    return forwardJson(req, '/cities', {method: 'POST', body, requireAuth: true});
}
