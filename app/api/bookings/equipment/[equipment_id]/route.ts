import {NextRequest} from 'next/server'
import {forwardPassthrough} from '@/app/api/_lib/proxy'

export async function GET(req: NextRequest, {params}: { params: Promise<{ equipment_id: string }> }) {
    const {equipment_id} = await params
    return forwardPassthrough(req, `/bookings/equipment/${encodeURIComponent(equipment_id)}`, {
        method: 'GET',
        requireAuth: true
    })
}
