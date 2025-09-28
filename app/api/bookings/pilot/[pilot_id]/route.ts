import {NextRequest} from 'next/server'
import {forwardPassthrough} from '@/app/api/_lib/proxy'

export async function GET(req: NextRequest, {params}: { params: Promise<{ pilot_id: string }> }) {
    const {pilot_id} = await params
    return forwardPassthrough(req, `/bookings/pilot/${encodeURIComponent(pilot_id)}`, {
        method: 'GET',
        requireAuth: true
    })
}
