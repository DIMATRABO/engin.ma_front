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
    filterData?: Record<string, unknown>;
};

export type EquipmentFilterForm = InputForm;
