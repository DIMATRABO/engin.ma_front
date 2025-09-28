import {NextRequest} from 'next/server'
import {forwardFormData} from '@/app/api/_lib/proxy'

export async function POST(req: NextRequest) {
    const form = await req.formData()
    return forwardFormData(req, '/equipment-images/add', {method: 'POST', formData: form, requireAuth: true})
}
