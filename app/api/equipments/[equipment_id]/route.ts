import {NextRequest} from 'next/server'
import {forwardPassthrough} from '@/app/api/_lib/proxy'

export async function DELETE(req: NextRequest, {params}: { params: Promise<{ equipment_id: string }> }) {
    const {equipment_id} = await params
    return forwardPassthrough(req, `/equipments/${encodeURIComponent(equipment_id)}`, {
        method: 'DELETE',
        requireAuth: true
    })
}
