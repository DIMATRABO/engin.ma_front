import {http} from '@/services/http'

export type CreateName = { name: string }
export type CreateCity = { name_en: string; name_fr: string; name_ar?: string }
export type CreateModel = { name: string; brand_id: string; category_id: string }
export type CreateCategory = { name_en: string; name_fr: string; name_ar: string; field_of_activity: string }

// Shapes for GET responses (loose to tolerate backend variations)
export type BrandRef = { id?: string; _id?: string; name?: string }
export type CategoryRef = {
    id?: string; _id?: string; name?: string;
    field_of_activity?: string;
    name_en?: string; name_fr?: string; name_ar?: string;
}
export type ModelRef = {
    id?: string; _id?: string; name?: string;
    brand?: BrandRef | string | null; brand_id?: string;
    category?: CategoryRef | string | null; category_id?: string;
}

export const refsService = {
    // Brands (via Next.js API to ensure Authorization header is attached)
    getBrands: () => http.get<BrandRef[]>('/api/brands'),
    createBrand: (payload: CreateName) => http.post<unknown, CreateName>('/api/brands', payload),

    // Cities (via Next.js API to ensure Authorization header is attached)
    getCities: () => http.get<unknown[]>('/api/cities'),
    createCity: (payload: CreateCity) => http.post<unknown, CreateCity>('/api/cities', payload),

    // Models (via Next.js API to ensure Authorization header is attached)
    getModels: () => http.get<ModelRef[]>('/api/models'),
    createModel: (payload: CreateModel) => http.post<unknown, CreateModel>('/api/models', payload),

    // Categories (via Next.js API to ensure Authorization header is attached)
    getCategories: () => http.get<CategoryRef[]>('/api/categories'),
    createCategory: (payload: CreateCategory) => http.post<unknown, CreateCategory>('/api/categories', payload),

    // Fields of Activity
    getFoa: () => http.get<string[]>('/api/foa'),
}
