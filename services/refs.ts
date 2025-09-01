import {http} from '@/services/http'

export type CreateName = { name: string }

export const refsService = {
    // Brands
    getBrands: () => http.get<unknown[]>('/brands'),
    createBrand: (payload: CreateName) => http.post<unknown, CreateName>('/brands', payload),

    // Cities
    getCities: () => http.get<unknown[]>('/cities'),
    createCity: (payload: CreateName) => http.post<unknown, CreateName>('/cities', payload),

    // Models
    getModels: () => http.get<unknown[]>('/models'),
    createModel: (payload: CreateName) => http.post<unknown, CreateName>('/models', payload),
}
