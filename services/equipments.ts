import {http} from '@/services/http'
import type {EquipmentFilterForm, PagedResponse} from '@/types/api'
import type {Equipment} from '@/types/project-entities.types'

export type CreateEquipment = {
    id?: string
    owner_id?: string
    pilot_id?: string
    brand_id?: string
    model_id?: string
    category_id?: string
    model_year?: number
    construction_year?: number
    date_of_customs_clearance?: number
    city_id?: string
    title?: string
    description?: string
    price_per_day?: number
    is_available?: boolean
    fields_of_activity?: string
}

export const equipmentsService = {
    // Use BFF endpoints so auth token from httpOnly cookies is attached server-side
    create: (payload: CreateEquipment) => http.post<unknown, CreateEquipment>('/api/equipments', payload),
    update: (payload: CreateEquipment) => http.put<unknown, CreateEquipment>('/api/equipments/update', payload),
    delete: (equipmentId: string) => http.delete<unknown>(`/api/equipments/${encodeURIComponent(equipmentId)}`),
    filter: (input: EquipmentFilterForm) => http.post<PagedResponse<Equipment>, EquipmentFilterForm>('/api/equipments/filter', input),
}
