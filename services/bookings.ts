import {http} from '@/services/http'
import type {ApiResponse, CreateBookingForm, EquipmentFilterForm, InputForm, UpdateBookingForm} from '@/types/api'
import type {Booking, Equipment, User} from '@/types/project-entities.types'

export type {CreateBookingForm, UpdateBookingForm} from '@/types/api'


export const bookingsService = {
    list: () => http.get<Booking[]>('/api/bookings'),
    create: (payload: CreateBookingForm) => http.post<Booking, CreateBookingForm>('/api/bookings', payload),
    update: (payload: UpdateBookingForm) => http.put<Booking, UpdateBookingForm>('/api/bookings', payload),
    listByEquipment: (equipmentId: string) => http.get<Booking[]>(`/api/bookings/equipment/${encodeURIComponent(equipmentId)}`),
    listByPilot: (pilotId: string) => http.get<Booking[]>(`/api/bookings/pilot/${encodeURIComponent(pilotId)}`),
    listByClient: (clientId: string) => http.get<Booking[]>(`/api/bookings/client/${encodeURIComponent(clientId)}`),

    // Select helpers for booking creation page
    listEquipments: async (): Promise<ApiResponse<Equipment[]>> => {
        const res = await http.post<unknown, EquipmentFilterForm>('/api/equipments/filter', {
            pageIndex: 1,
            pageSize: 1000,
            sort: {key: 'created_at', order: 'desc'},
            query: '',
        })
        const data: any = res?.data
        const items: Equipment[] = Array.isArray((data as any)?.items)
            ? (data as any).items as Equipment[]
            : (Array.isArray((data as any)?.data) ? (data as any).data as Equipment[] : (Array.isArray(data) ? (data as Equipment[]) : []))
        return {...res, data: items}
    },
    listClients: async (): Promise<ApiResponse<User[]>> => {
        // Backend ignores role filter for CLIENT; fetch users and filter on frontend by role membership
        const res = await http.post<unknown, InputForm>('/api/users/list', {
            pageIndex: 1,
            pageSize: 1000,
            sort: {key: 'username', order: 'asc'},
            query: '',
            filterData: {status: 'ACTIVE'},
        })
        const data: any = res?.data
        const raw: any[] = Array.isArray(data?.items)
            ? (data.items as any[])
            : (Array.isArray(data?.data) ? (data.data as any[]) : (Array.isArray(data) ? (data as any[]) : []))
        const items: User[] = raw.filter((u: any) => {
            const roles: any[] = Array.isArray(u?.roles)
                ? u.roles
                : (Array.isArray(u?.user_roles) ? u.user_roles : (Array.isArray(u?.roles_list) ? u.roles_list : []))
            return roles.some((r: any) => {
                const val = typeof r === 'string' ? r : (typeof r?.role === 'string' ? r.role : undefined)
                return typeof val === 'string' && val.toUpperCase() === 'CLIENT'
            })
        }) as User[]
        return {...res, data: items}
    },
    listPilots: async (): Promise<ApiResponse<User[]>> => {
        // Use dedicated pilots endpoint
        const res = await http.get<User[]>('/api/pilotes')
        const data: any = res?.data
        const items: User[] = Array.isArray(data?.items)
            ? (data.items as User[])
            : (Array.isArray(data?.data) ? (data.data as User[]) : (Array.isArray(data) ? (data as User[]) : []))
        return {...res, data: items}
    },
}
