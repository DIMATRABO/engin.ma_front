import type {BookingStatus, ID} from './project-entities.types'

export type ApiResponse<T> = {
    data: T;
    status: number;
    headers: Headers;
};

export class ApiError<T = unknown> extends Error {
    status: number;
    data?: T;

    constructor(message: string, status: number, data?: T) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Lightweight shared API types for Phase 2
export type SortOrder = 'asc' | 'desc';
export type Sort = { key: string; order: SortOrder };

export type PagedResponse<TItem> = {
    items: TItem[];
    total: number;
    pageIndex: number;
    pageSize: number;
};

export type InputForm = {
    pageIndex: number;
    pageSize: number;
    sort: Sort; // required by backend
    query: string; // required by backend (default "")
    // All filters, including status, should be nested inside filterData to match backend contract
    filterData?: Record<string, unknown>;
};

export type EquipmentFilterForm = InputForm;


// Swagger-derived DTOs
export type CreateBookingForm = {
    client_id: ID;
    equipment_id: ID;
    pilot_id?: ID;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
};

export type UpdateBookingForm = {
    id: ID;
    client_id?: ID;
    equipment_id?: ID;
    pilot_id?: ID;
    start_date?: string; // YYYY-MM-DD
    end_date?: string; // YYYY-MM-DD
    status?: BookingStatus | string; // Tolerate string from backend
};

export type BookingFilterForm = InputForm;
