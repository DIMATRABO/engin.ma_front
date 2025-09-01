import {http} from '@/services/http'
import {getApiBaseUrl} from '@/lib/env'

export type UploadImageForm = {
    file: File
    equipment_id: string
}

export type DeleteImageForm = { id: string }

export const imagesService = {
    upload: ({file, equipment_id}: UploadImageForm) => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('equipment_id', equipment_id)
        return http.post<unknown, FormData>('/equipment-images/add', fd)
    },
    listByEquipment: (equipmentId: string) =>
        http.get<unknown[]>(`/equipment-images/by-equipment/${encodeURIComponent(equipmentId)}`),
    delete: (payload: DeleteImageForm) => http.delete<unknown, DeleteImageForm>('/equipment-images', payload),
    getImageUrl: (filename: string) => {
        const base = getApiBaseUrl()
        if (!base) return ''
        return `${base}/equipment-images/${encodeURIComponent(filename)}`
    },
}
