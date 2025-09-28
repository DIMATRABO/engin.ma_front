import {NextRequest} from 'next/server'
import {forwardPassthrough} from '@/app/api/_lib/proxy'

export async function GET(req: NextRequest, {params}: { params: Promise<{ filename: string }> }) {
    const {filename} = await params
    return forwardPassthrough(req, `/equipment-images/${encodeURIComponent(filename)}`, {
        method: 'GET',
        requireAuth: true
    })
}
