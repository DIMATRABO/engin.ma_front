import {http} from '@/services/http'
import type {ApiResponse} from '@/types/api'

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

    // Select helpers for booking creation page
    listEquipments: async (): Promise<ApiResponse<unknown[]>> => {
        const res = await http.post<any, any>('/api/equipments/filter', {
            pageIndex: 0,
            pageSize: 1000,
            sort: {key: 'created_at', order: 'desc'},
            query: '',
        })
        const data: any = res?.data
        const items: unknown[] = Array.isArray(data?.items)
            ? data.items
            : (Array.isArray(data) ? data : [])
        return {...res, data: items}
    },
    listClients: async (): Promise<ApiResponse<unknown[]>> => {
        const res = await http.post<any, any>('/api/users/list', {
            pageIndex: 0,
            pageSize: 1000,
            sort: {key: 'username', order: 'asc'},
            query: '',
            filterData: {role: 'CLIENT'},
        })
        const data: any = res?.data
        const items: unknown[] = Array.isArray(data?.items)
            ? data.items
            : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))
        return {...res, data: items}
    },
    listPilots: async (): Promise<ApiResponse<unknown[]>> => {
        const res = await http.post<any, any>('/api/users/list', {
            pageIndex: 0,
            pageSize: 1000,
            sort: {key: 'username', order: 'asc'},
            query: '',
            filterData: {role: 'PILOT'},
        })
        const data: any = res?.data
        const items: unknown[] = Array.isArray(data?.items)
            ? data.items
            : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))
        return {...res, data: items}
    },
}
