import {http} from '@/services/http'

export type CreateBookingForm = {
    client_id: string
    equipment_id: string
    pilot_id: string
    start_date: string // YYYY-MM-DD
    end_date: string // YYYY-MM-DD
}

export type UpdateBookingForm = {
    id: string
    client_id?: string
    equipment_id?: string
    pilot_id?: string
    start_date?: string
    end_date?: string
    status?: string
}

export const bookingsService = {
    list: () => http.get<unknown[]>('/api/bookings'),
    create: (payload: CreateBookingForm) => http.post<unknown, CreateBookingForm>('/api/bookings', payload),
    update: (payload: UpdateBookingForm) => http.put<unknown, UpdateBookingForm>('/api/bookings', payload),
    listByEquipment: (equipmentId: string) => http.get<unknown[]>(`/api/bookings/equipment/${encodeURIComponent(equipmentId)}`),
    listByPilot: (pilotId: string) => http.get<unknown[]>(`/api/bookings/pilot/${encodeURIComponent(pilotId)}`),
    listByClient: (clientId: string) => http.get<unknown[]>(`/api/bookings/client/${encodeURIComponent(clientId)}`),
}
