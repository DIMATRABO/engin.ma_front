'use client'

import React from 'react'
import {useQuery} from '@tanstack/react-query'
import {refsService} from '@/services/refs'
import {useTranslations} from 'next-intl'
import {DualRangeSlider} from '@/components/ui/DualRangeSlider'

// Reference item minimal shape
interface RefItem {
    id?: string;
    _id?: string;
    name?: string
}

// Minimal user shape for pilot dropdown
interface UserItem {
    id?: string;
    name?: string;
    username?: string;
    email?: string
}

// Minimal shape we rely on for rendering. Fields may be absent; fallback to '-'.
type Equipment = {
    id?: string
    title?: string
    brand?: { name?: string } | string | null
    model?: { name?: string } | string | null
    city?: { name?: string } | string | null
    brand_name?: string
    model_name?: string
    city_name?: string
    price_per_day?: number
    is_available?: boolean
    [k: string]: unknown
}

type Paged<T> = { items?: T[]; total?: number; pageIndex?: number; pageSize?: number }

type Filters = {
    query: string
    // supported filters per backend example
    owner_id?: string
    pilot_id?: string
    city_id?: string
    fields_of_activity?: string // comma-separated list in UI, will be split
    model_year_min?: number
    model_year_max?: number
    construction_year_min?: number
    construction_year_max?: number
    customs_clearance_year_min?: number
    customs_clearance_year_max?: number
    price_min?: number
    price_max?: number
    rating_min?: number
    rating_max?: number
}

async function fetchEquipments(input: {
    pageIndex: number
    pageSize: number
    query: string
    // supported
    owner_id?: string
    pilot_id?: string
    city_id?: string
    fields_of_activity?: string
    model_year_min?: number
    model_year_max?: number
    construction_year_min?: number
    construction_year_max?: number
    customs_clearance_year_min?: number
    customs_clearance_year_max?: number
    price_min?: number
    price_max?: number
    rating_min?: number
    rating_max?: number
    sort: { key: string; order: 'asc' | 'desc' }
}): Promise<Paged<Equipment>> {
    // Build filterData using only supported backend keys.
    const filter: Record<string, unknown> = {
        ...(input.owner_id ? {owner_id: input.owner_id} : {}),
        ...(input.pilot_id ? {pilot_id: input.pilot_id} : {}),
        ...(input.city_id ? {city_ids: [input.city_id]} : {}),
        ...(() => {
            const arr = (input.fields_of_activity || '')
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            return arr.length > 0 ? {fields_of_activity: arr} : {}
        })(),
        ...((input.model_year_min != null && input.model_year_max != null)
            ? {model_year_range: [input.model_year_min, input.model_year_max]}
            : {}),
        ...((input.construction_year_min != null && input.construction_year_max != null)
            ? {construction_year_range: [input.construction_year_min, input.construction_year_max]}
            : {}),
        ...((input.customs_clearance_year_min != null && input.customs_clearance_year_max != null)
            ? {date_of_customs_clearance_range: [input.customs_clearance_year_min, input.customs_clearance_year_max]}
            : {}),
        ...((input.price_min != null && input.price_max != null)
            ? {price_range: [input.price_min, input.price_max]}
            : {}),
        ...((input.rating_min != null && input.rating_max != null)
            ? {rating_range: [input.rating_min, input.rating_max]}
            : {}),
    }
    const body: Record<string, unknown> = {
        pageIndex: input.pageIndex,
        pageSize: input.pageSize,
        sort: input.sort,
        query: input.query ?? '',
    }
    if (Object.keys(filter).length > 0) body.filterData = filter
    const res = await fetch('/api/equipments/filter', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.message || 'Failed to load equipments')
    }
    const raw = await res.json().catch(() => ({} as unknown)) as unknown
    // Client-side normalization fallback in case proxy returns raw backend shape
    if (raw && typeof raw === 'object') {
        const obj = raw as {
            items?: unknown[];
            data?: unknown[];
            total?: number;
            pageIndex?: number;
            pageSize?: number;
            [k: string]: unknown
        }
        const items = Array.isArray(obj.items) ? obj.items : Array.isArray(obj.data) ? obj.data : undefined
        const total = typeof obj.total === 'number' ? obj.total : Array.isArray(items) ? items.length : 0
        if (items) {
            return {
                items: items as Equipment[],
                total,
                pageIndex: typeof obj.pageIndex === 'number' ? obj.pageIndex : input.pageIndex,
                pageSize: typeof obj.pageSize === 'number' ? obj.pageSize : input.pageSize,
            }
        }
    }
    // If shape is unexpected, return empty but valid structure
    return {items: [], total: 0, pageIndex: input.pageIndex, pageSize: input.pageSize}
}

function getName(val: unknown): string {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object' && 'name' in val) {
        const name = (val as { name?: unknown }).name
        if (typeof name === 'string') return name
    }
    return '-'
}

function getUserLabel(u?: UserItem): string {
    if (!u) return '-'
    return u.name || u.username || u.email || '-'
}

export default function AdminEquipmentsPage() {
    const t = useTranslations('admin.equipments')
    const tFoa = useTranslations('admin.equipments.foa')
    const [pageIndex, setPageIndex] = React.useState(1)
    const [pageSize] = React.useState(10)

    const [filters, setFilters] = React.useState<Filters>({
        query: '',
    })

    const {data: citiesData} = useQuery({
        queryKey: ['refs', 'cities'],
        queryFn: () => refsService.getCities().then((r) => r.data).catch(() => [] as unknown[]),
        staleTime: 60_000,
    })

    // Load fields of activity list
    const {data: foaData} = useQuery<string[]>({
        queryKey: ['refs', 'foa'],
        queryFn: () => refsService.getFoa().then((r) => r.data).catch(() => [] as string[]),
        staleTime: 60_000,
    })
    const foaList: string[] = Array.isArray(foaData) ? foaData : []

    // Load owners list (for Owner dropdown)
    const {data: ownersData} = useQuery<UserItem[]>({
        queryKey: ['owners', 'list'],
        queryFn: async () => {
            const res = await fetch('/api/owners', {method: 'GET'})
            if (!res.ok) {
                const err = await res.text().catch(() => '')
                throw new Error(err || 'Failed to load owners')
            }
            const raw = await res.json().catch(() => ({} as unknown)) as unknown
            if (Array.isArray(raw)) {
                return (raw as Array<Record<string, unknown>>).map((u) => ({
                    id: typeof u.id === 'string' ? u.id : undefined,
                    name: typeof u.name === 'string' ? u.name : undefined,
                    username: typeof u.username === 'string' ? u.username : undefined,
                    email: typeof u.email === 'string' ? u.email : undefined,
                }))
            }
            return [] as UserItem[]
        },
        staleTime: 60_000,
    })

    // Load pilots list (for Pilot dropdown)
    const {data: pilotsData} = useQuery<UserItem[]>({
        queryKey: ['pilotes', 'list'],
        queryFn: async () => {
            const res = await fetch('/api/pilotes', {method: 'GET'})
            if (!res.ok) {
                const err = await res.text().catch(() => '')
                throw new Error(err || 'Failed to load pilots')
            }
            const raw = await res.json().catch(() => ({} as unknown)) as unknown
            if (Array.isArray(raw)) {
                return (raw as Array<Record<string, unknown>>).map((u) => ({
                    id: typeof u.id === 'string' ? u.id : undefined,
                    name: typeof u.name === 'string' ? u.name : undefined,
                    username: typeof u.username === 'string' ? u.username : undefined,
                    email: typeof u.email === 'string' ? u.email : undefined,
                }))
            }
            return [] as UserItem[]
        },
        staleTime: 60_000,
    })


    const cities: RefItem[] = Array.isArray(citiesData) ? (citiesData as RefItem[]) : []

    const [applied, setApplied] = React.useState(filters)
    const defaultSort = React.useMemo(() => ({key: 'title', order: 'asc' as const}), [])

    const {data, isFetching, isError, error, refetch} = useQuery({
        queryKey: ['equipments', 'filter', {pageIndex, pageSize, sort: defaultSort, ...applied}],
        queryFn: () =>
            fetchEquipments({
                pageIndex,
                pageSize,
                query: applied.query,
                owner_id: applied.owner_id,
                pilot_id: applied.pilot_id,
                city_id: applied.city_id,
                fields_of_activity: applied.fields_of_activity,
                model_year_min: applied.model_year_min,
                model_year_max: applied.model_year_max,
                construction_year_min: applied.construction_year_min,
                construction_year_max: applied.construction_year_max,
                customs_clearance_year_min: applied.customs_clearance_year_min,
                customs_clearance_year_max: applied.customs_clearance_year_max,
                price_min: applied.price_min,
                price_max: applied.price_max,
                rating_min: applied.rating_min,
                rating_max: applied.rating_max,
                sort: defaultSort,
            }),
        placeholderData: (prev) => prev,
        staleTime: 30_000,
    })

    const items = data?.items ?? []
    const total = data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    function applyFilters() {
        setPageIndex(1)
        setApplied(filters)
    }

    function resetFilters() {
        setFilters({query: ''})
        setApplied({query: ''})
        setPageIndex(1)
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>

            {/* Toolbar */}
            <div className="rounded-lg border bg-card p-4 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.search')}</label>
                    <input
                        type="search"
                        className="w-full h-9 border border-input bg-background rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder={t('labels.searchPlaceholder')}
                        value={filters.query}
                        onChange={(e) => setFilters((f) => ({...f, query: e.target.value}))}
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.city')}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm min-w-[160px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.city_id ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, city_id: e.target.value || undefined}))}
                    >
                        <option value="">{t('labels.all')}</option>
                        {cities.map((c, idx) => (
                            <option key={`${c.id ?? c._id ?? c.name ?? idx}`}
                                    value={c.id ?? c._id ?? ''}>{c.name ?? '-'}</option>
                        ))}
                    </select>
                </div>
                {/* Supported filters */}
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.owner')}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm min-w-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.owner_id ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, owner_id: e.target.value || undefined}))}
                    >
                        <option value="">{t('labels.allOwners')}</option>
                        {(ownersData ?? []).map((u, idx) => {
                            const id = u.id ?? ''
                            const label = getUserLabel(u)
                            return (
                                <option key={id || idx} value={id}>
                                    {label}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.pilot')}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm min-w-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.pilot_id ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, pilot_id: e.target.value || undefined}))}
                    >
                        <option value="">{t('labels.allPilots')}</option>
                        {(pilotsData ?? []).map((u, idx) => {
                            const id = u.id ?? ''
                            const label = getUserLabel(u)
                            return (
                                <option key={id || idx} value={id}>
                                    {label}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.fieldsOfActivity')}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm min-w-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.fields_of_activity ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, fields_of_activity: e.target.value || undefined}))}
                    >
                        <option value="">{t('labels.all')}</option>
                        {(foaList).map((val) => (
                            <option key={val} value={val}>{tFoa(val)}</option>
                        ))}
                    </select>
                </div>
                {/* Ranges (Dual sliders) */}
                {/* Model year */}
                <div className="flex flex-col min-w-[240px]">
                    <label className="block text-xs text-muted-foreground mb-2">{t('labels.modelYearRange')}</label>
                    <DualRangeSlider
                        min={1970}
                        max={new Date().getFullYear()}
                        step={1}
                        value={[
                            (filters.model_year_min ?? 1970),
                            (filters.model_year_max ?? new Date().getFullYear()),
                        ]}
                        onValueChange={(vals) =>
                            setFilters((f) => ({
                                ...f,
                                model_year_min: Array.isArray(vals) ? (vals[0] as number) : undefined,
                                model_year_max: Array.isArray(vals) ? (vals[1] as number) : undefined,
                            }))
                        }
                        label={(v) => (v != null ? Math.round(v) : '')}
                    />
                </div>
                {/* Construction year */}
                <div className="flex flex-col min-w-[240px]">
                    <label
                        className="block text-xs text-muted-foreground mb-2">{t('labels.constructionYearRange')}</label>
                    <DualRangeSlider
                        min={1970}
                        max={new Date().getFullYear()}
                        step={1}
                        value={[
                            (filters.construction_year_min ?? 1970),
                            (filters.construction_year_max ?? new Date().getFullYear()),
                        ]}
                        onValueChange={(vals) =>
                            setFilters((f) => ({
                                ...f,
                                construction_year_min: Array.isArray(vals) ? (vals[0] as number) : undefined,
                                construction_year_max: Array.isArray(vals) ? (vals[1] as number) : undefined,
                            }))
                        }
                        label={(v) => (v != null ? Math.round(v) : '')}
                    />
                </div>
                {/* Customs clearance year */}
                <div className="flex flex-col min-w-[260px]">
                    <label className="block text-xs text-muted-foreground mb-2">{t('labels.customsYearRange')}</label>
                    <DualRangeSlider
                        min={1970}
                        max={new Date().getFullYear()}
                        step={1}
                        value={[
                            (filters.customs_clearance_year_min ?? 1970),
                            (filters.customs_clearance_year_max ?? new Date().getFullYear()),
                        ]}
                        onValueChange={(vals) =>
                            setFilters((f) => ({
                                ...f,
                                customs_clearance_year_min: Array.isArray(vals) ? (vals[0] as number) : undefined,
                                customs_clearance_year_max: Array.isArray(vals) ? (vals[1] as number) : undefined,
                            }))
                        }
                        label={(v) => (v != null ? Math.round(v) : '')}
                    />
                </div>
                {/* Price */}
                <div className="flex flex-col min-w-[260px]">
                    <label className="block text-xs text-muted-foreground mb-2">{t('labels.priceRange')}</label>
                    <DualRangeSlider
                        min={0}
                        max={100000}
                        step={50}
                        value={[
                            (filters.price_min ?? 0),
                            (filters.price_max ?? 100000),
                        ]}
                        onValueChange={(vals) =>
                            setFilters((f) => ({
                                ...f,
                                price_min: Array.isArray(vals) ? (vals[0] as number) : undefined,
                                price_max: Array.isArray(vals) ? (vals[1] as number) : undefined,
                            }))
                        }
                        label={(v) => (v != null ? `${Math.round(v)} MAD` : '')}
                    />
                </div>
                {/* Rating */}
                <div className="flex flex-col min-w-[240px]">
                    <label className="block text-xs text-slate-600 mb-2">{t('labels.ratingRange')}</label>
                    <DualRangeSlider
                        min={0}
                        max={5}
                        step={0.1}
                        value={[
                            (filters.rating_min ?? 0),
                            (filters.rating_max ?? 5),
                        ]}
                        onValueChange={(vals) =>
                            setFilters((f) => ({
                                ...f,
                                rating_min: Array.isArray(vals) ? Number((vals[0] as number).toFixed(1)) : undefined,
                                rating_max: Array.isArray(vals) ? Number((vals[1] as number).toFixed(1)) : undefined,
                            }))
                        }
                        label={(v) => (v != null ? v.toFixed(1) : '')}
                    />
                </div>
                <div className="ms-auto flex items-center gap-3">
                    <button
                        onClick={applyFilters}
                        className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50"
                        disabled={isFetching}
                    >
                        {t('buttons.apply')}
                    </button>
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                        {t('buttons.reset')}
                    </button>
                </div>
            </div>

            {/* Table container */}
            <div className="rounded-lg border bg-card">
                {isError ? (
                    <div className="p-4">
                        <div className="text-sm text-red-600">{(error as Error)?.message || t('error')}</div>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                            {t('buttons.retry')}
                        </button>
                    </div>
                ) : items.length === 0 && !isFetching ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <div className="mb-2">{t('empty')}</div>
                        <button
                            onClick={resetFilters}
                            className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                        >{t('buttons.clearFilters')}
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="text-left font-medium px-3 py-2 border-b">{t('table.title')}</th>
                                <th className="text-left font-medium px-3 py-2 border-b">{t('table.brand')}</th>
                                <th className="text-left font-medium px-3 py-2 border-b">{t('table.model')}</th>
                                <th className="text-left font-medium px-3 py-2 border-b">{t('table.city')}</th>
                                <th className="text-left font-medium px-3 py-2 border-b">{t('table.pricePerDay')}</th>
                                <th className="text-left font-medium px-3 py-2 border-b">{t('table.available')}</th>
                                <th className="text-left font-medium px-3 py-2 border-b">{t('table.actions')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {isFetching && items.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-40"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-24"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-24"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-24"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-16"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-12"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-20"/>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                items.map((it, idx) => (
                                    <tr key={(it.id as string) ?? idx} className="hover:bg-slate-50">
                                        <td className="px-3 py-2 border-b">{it.title ?? '-'}</td>
                                        <td className="px-3 py-2 border-b">{getName(it.brand) || it.brand_name || '-'}</td>
                                        <td className="px-3 py-2 border-b">{getName(it.model) || it.model_name || '-'}</td>
                                        <td className="px-3 py-2 border-b">{getName(it.city) || it.city_name || '-'}</td>
                                        <td className="px-3 py-2 border-b">{it.price_per_day != null ? `${it.price_per_day} MAD` : '-'}</td>
                                        <td className="px-3 py-2 border-b">
                                            {it.is_available ? (
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{t('table.yes')}</span>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{t('table.no')}</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <button className="text-slate-600 hover:underline text-xs">Actions</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                <div className="flex items-center justify-between p-3">
                    <div className="text-sm text-muted-foreground">{t('pagination.pageOf', {
                        page: pageIndex,
                        total: totalPages
                    })}</div>
                    <div className="flex items-center gap-2">
                        <button
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                            disabled={pageIndex <= 1 || isFetching}
                            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                        >
                            {t('pagination.previous')}
                        </button>
                        <button
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                            disabled={pageIndex >= totalPages || isFetching}
                            onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                        >
                            {t('pagination.next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
