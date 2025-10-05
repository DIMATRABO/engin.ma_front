'use client'

import React from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {refsService} from '@/services/refs'
import {useLocale, useTranslations} from 'next-intl'
import {DualRangeSlider} from '@/components/ui/DualRangeSlider'
import {usePathname, useRouter} from '@/i18n/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Portal from '@/components/ui/Portal'
import {toast} from 'sonner'
import {useSearchParams} from 'next/navigation'
import {z} from 'zod'

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
    brand?: { name?: string; id?: string; _id?: string } | string | null
    model?: { name?: string; id?: string; _id?: string; brand_id?: string } | string | null
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
    const router = useRouter()
    const locale = useLocale()
    const getRefName = React.useCallback((it: any): string => {
        if (typeof it === 'string') return it
        if (!it || typeof it !== 'object') return '-'
        const key = locale === 'ar' ? 'name_ar' : (locale === 'fr' ? 'name_fr' : 'name_en')
        const val = (it as any)[key] ?? (it as any).name ?? (it as any).label ?? (it as any).title
        return typeof val === 'string' && val.trim().length > 0 ? val : '-'
    }, [locale])
    const getLocalizedName = React.useCallback((val: unknown): string => {
        if (typeof val === 'string') return val
        if (!val || typeof val !== 'object') return '-'
        const key = locale === 'ar' ? 'name_ar' : (locale === 'fr' ? 'name_fr' : 'name_en')
        const obj = val as any
        const name = obj[key] ?? obj.name ?? obj.label ?? obj.title
        return typeof name === 'string' && name.trim().length > 0 ? name : '-'
    }, [locale])
    const qc = useQueryClient()
    const [pageIndex, setPageIndex] = React.useState(1)
    const [pageSize] = React.useState(10)

    const [filters, setFilters] = React.useState<Filters>({
        query: '',
    })

    const [applied, setApplied] = React.useState(filters)

    // URL <-> state sync for query and page
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const initialized = React.useRef(false)

    React.useEffect(() => {
        if (initialized.current) return
        const q = searchParams.get('q')
        const pageParam = searchParams.get('page')
        if (q != null) {
            setFilters((f) => ({...f, query: q}))
            setApplied((a) => ({...a, query: q}))
        }
        if (pageParam) {
            const p = parseInt(pageParam, 10)
            if (Number.isFinite(p) && p >= 1) setPageIndex(p)
        }
        initialized.current = true
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        const sp = new URLSearchParams()
        if (applied.query) sp.set('q', applied.query)
        if (pageIndex > 1) sp.set('page', String(pageIndex))
        const qs = sp.toString()
        const url = qs ? `${pathname}?${qs}` : pathname
        try {
            router.replace(url)
        } catch {
        }
    }, [applied.query, pageIndex, pathname, router])

    const {data: citiesData} = useQuery({
        queryKey: ['refs', 'cities'],
        queryFn: () => refsService.getCities().then((r) => r.data).catch(() => [] as unknown[]),
        staleTime: 60_000,
    })

    // Additional refs for quick create/edit
    const {data: brandsData} = useQuery({
        queryKey: ['refs', 'brands'],
        queryFn: () => refsService.getBrands().then((r) => r.data).catch(() => [] as unknown[]),
        staleTime: 60_000,
    })
    const {data: modelsData} = useQuery({
        queryKey: ['refs', 'models'],
        queryFn: () => refsService.getModels().then((r) => r.data).catch(() => [] as unknown[]),
        staleTime: 60_000,
    })
    const {data: categoriesData} = useQuery({
        queryKey: ['refs', 'categories', locale],
        queryFn: () => refsService.getCategories().then((r) => r.data).catch(() => [] as unknown[]),
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

    // Delete confirmation dialog state
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [toDeleteId, setToDeleteId] = React.useState<string | undefined>(undefined)
    const [toDeleteTitle, setToDeleteTitle] = React.useState<string | undefined>(undefined)

    // Quick add dialog state
    const [addOpen, setAddOpen] = React.useState(false)
    const [addSaving, setAddSaving] = React.useState(false)
    const [addForm, setAddForm] = React.useState({
        title: '',
        brand_id: '',
        model_id: '',
        category_id: '',
        city_id: '',
        owner_id: '',
        pilot_id: '',
        fields_of_activity: '',
        description: '',
        is_available: true,
        model_year: '' as string | number,
        construction_year: '' as string | number,
        date_of_customs_clearance: '' as string | number,
        price_per_day: '' as string | number,
    })
    const [addErrors, setAddErrors] = React.useState<Record<string, string>>({})

    // Quick edit drawer state
    const [editOpen, setEditOpen] = React.useState(false)
    const [editSaving, setEditSaving] = React.useState(false)
    const [editId, setEditId] = React.useState<string | undefined>(undefined)
    const [editForm, setEditForm] = React.useState({
        title: '',
        brand_id: '',
        model_id: '',
        category_id: '',
        city_id: '',
        owner_id: '',
        pilot_id: '',
        fields_of_activity: '',
        description: '',
        is_available: true,
        model_year: '' as string | number,
        construction_year: '' as string | number,
        date_of_customs_clearance: '' as string | number,
        price_per_day: '' as string | number,
    })
    const [editErrors, setEditErrors] = React.useState<Record<string, string>>({})

    function validateEdit(): boolean {
        const reqMsg = t('validation.required')
        const schema = z.object({
            title: z.string().min(1, reqMsg),
            brand_id: z.string().min(1, reqMsg),
            model_id: z.string().min(1, reqMsg),
            category_id: z.string().min(1, reqMsg),
            city_id: z.string().min(1, reqMsg),
            owner_id: z.string().min(1, reqMsg),
            pilot_id: z.string().min(1, reqMsg),
            fields_of_activity: z.string().min(1, reqMsg),
            description: z.string().min(1, reqMsg),
            model_year: z.union([z.number(), z.string().min(1, reqMsg)]),
            construction_year: z.union([z.number(), z.string().min(1, reqMsg)]),
            date_of_customs_clearance: z.union([z.number(), z.string().min(1, reqMsg)]),
            price_per_day: z.union([z.number(), z.string().min(1, reqMsg)]),
        })
        const res = schema.safeParse(editForm)
        if (res.success) {
            setEditErrors({});
            return true
        }
        const e: Record<string, string> = {}
        for (const issue of res.error.issues) {
            const path = issue.path[0] as string
            e[path] = issue.message || reqMsg
        }
        setEditErrors(e)
        return false
    }

    async function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!editId) return
        if (!validateEdit()) return
        const payload = {
            id: editId,
            title: editForm.title,
            brand_id: editForm.brand_id,
            model_id: editForm.model_id,
            category_id: editForm.category_id,
            city_id: editForm.city_id,
            owner_id: editForm.owner_id,
            pilot_id: editForm.pilot_id,
            fields_of_activity: editForm.fields_of_activity,
            description: editForm.description,
            is_available: !!editForm.is_available,
            model_year: Number(editForm.model_year),
            construction_year: Number(editForm.construction_year),
            date_of_customs_clearance: Number(editForm.date_of_customs_clearance),
            price_per_day: Number(editForm.price_per_day),
        }
        setEditSaving(true)
        try {
            const res = await fetch('/api/equipments/update', {
                method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
            })
            if (!res.ok) {
                const msg = await res.text().catch(() => '')
                toast.error(msg || t('error'))
                return
            }
            toast.success(t('updated'))
            try {
                await qc.invalidateQueries({queryKey: ['equipments', 'filter']})
            } catch {
            }
            setEditOpen(false)
        } catch {
            toast.error('Unexpected error')
        } finally {
            setEditSaving(false)
        }
    }

    const brands: RefItem[] = Array.isArray(brandsData) ? (brandsData as RefItem[]) : []
    const models: RefItem[] = Array.isArray(modelsData) ? (modelsData as RefItem[]) : []
    const cities: RefItem[] = Array.isArray(citiesData) ? (citiesData as RefItem[]) : []
    const categories: RefItem[] = Array.isArray(categoriesData) ? (categoriesData as RefItem[]) : []

    function validateAdd(): boolean {
        const reqMsg = t('validation.required')
        const schema = z.object({
            title: z.string().min(1, reqMsg),
            brand_id: z.string().min(1, reqMsg),
            model_id: z.string().min(1, reqMsg),
            category_id: z.string().min(1, reqMsg),
            city_id: z.string().min(1, reqMsg),
            owner_id: z.string().min(1, reqMsg),
            pilot_id: z.string().min(1, reqMsg),
            fields_of_activity: z.string().min(1, reqMsg),
            description: z.string().min(1, reqMsg),
            model_year: z.union([z.number(), z.string().min(1, reqMsg)]),
            construction_year: z.union([z.number(), z.string().min(1, reqMsg)]),
            date_of_customs_clearance: z.union([z.number(), z.string().min(1, reqMsg)]),
            price_per_day: z.union([z.number(), z.string().min(1, reqMsg)]),
        })
        const res = schema.safeParse(addForm)
        if (res.success) {
            setAddErrors({})
            return true
        }
        const e: Record<string, string> = {}
        for (const issue of res.error.issues) {
            const path = issue.path[0] as string
            e[path] = issue.message || reqMsg
        }
        setAddErrors(e)
        return false
    }

    async function handleAddSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validateAdd()) return
        const payload = {
            title: addForm.title,
            brand_id: addForm.brand_id,
            model_id: addForm.model_id,
            category_id: addForm.category_id,
            city_id: addForm.city_id,
            owner_id: addForm.owner_id,
            pilot_id: addForm.pilot_id,
            fields_of_activity: addForm.fields_of_activity,
            description: addForm.description,
            is_available: !!addForm.is_available,
            model_year: Number(addForm.model_year),
            construction_year: Number(addForm.construction_year),
            date_of_customs_clearance: Number(addForm.date_of_customs_clearance),
            price_per_day: Number(addForm.price_per_day),
        }
        setAddSaving(true)
        try {
            const res = await fetch('/api/equipments', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const raw = await res.text().catch(() => '')
                toast.error(raw || t('error'))
                return
            }
            toast.success(t('created'))
            try {
                await qc.invalidateQueries({queryKey: ['equipments', 'filter']})
            } catch {
            }
            setAddOpen(false)
            setAddForm({
                title: '', brand_id: '', model_id: '', category_id: '', city_id: '', owner_id: '', pilot_id: '',
                fields_of_activity: '', description: '', is_available: true,
                model_year: '', construction_year: '', date_of_customs_clearance: '', price_per_day: ''
            })
        } catch {
            toast.error('Unexpected error')
        } finally {
            setAddSaving(false)
        }
    }

    async function doDelete() {
        const id = toDeleteId
        if (!id) return
        try {
            const res = await fetch(`/api/equipments/${encodeURIComponent(id)}`, {method: 'DELETE'})
            if (!res.ok) {
                const msg = await res.text().catch(() => '')
                toast?.error(msg || t('error'))
                return
            }
            toast?.success(t('buttons.delete'))
            try {
                await qc.invalidateQueries({queryKey: ['equipments', 'filter']})
            } catch {
            }
        } catch {
            // ignore but keep UI responsive
        } finally {
            setToDeleteId(undefined)
            setToDeleteTitle(undefined)
        }
    }

    function applyFilters() {
        setPageIndex(1)
        setApplied(filters)
    }

    function resetFilters() {
        setFilters({query: ''})
        setApplied({query: ''})
        setPageIndex(1)
    }

    const [filtersOpen, setFiltersOpen] = React.useState(false)
    const filterSheetRef = React.useRef<HTMLDivElement | null>(null)
    const filterToggleBtnRef = React.useRef<HTMLButtonElement | null>(null)

    const appliedCount = React.useMemo(() => {
        const f = applied
        let n = 0
        if (f.city_id) n++
        if (f.owner_id) n++
        if (f.pilot_id) n++
        if (f.fields_of_activity) n++
        if (f.model_year_min != null && f.model_year_max != null) n++
        if (f.construction_year_min != null && f.construction_year_max != null) n++
        if (f.customs_clearance_year_min != null && f.customs_clearance_year_max != null) n++
        if (f.price_min != null && f.price_max != null) n++
        if (f.rating_min != null && f.rating_max != null) n++
        return n
    }, [applied])

    React.useEffect(() => {
        if (!filtersOpen) return
        const root = filterSheetRef.current
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        const getItems = () => (root ? Array.from(root.querySelectorAll<HTMLElement>(sel)) : [])
        const items = getItems()
        ;(items[0] || root || document.body)?.focus?.()

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.preventDefault()
                setFiltersOpen(false)
                filterToggleBtnRef.current?.focus()
                return
            }
            if (e.key !== 'Tab' || !root) return
            const list = getItems()
            if (list.length === 0) return
            const first = list[0]
            const last = list[list.length - 1]
            const active = document.activeElement as HTMLElement | null
            if (e.shiftKey) {
                if (active === first || !(active && root.contains(active))) {
                    e.preventDefault();
                    last.focus()
                }
            } else {
                if (active === last || !(active && root.contains(active))) {
                    e.preventDefault();
                    first.focus()
                }
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = prevOverflow
        }
    }, [filtersOpen])

    function FilterControls({onApplied}: { onApplied?: () => void }) {
        return (
            <div className="flex flex-col gap-3">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.search')}</label>
                    <input
                        type="search"
                        className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder={t('labels.searchPlaceholder')}
                        value={filters.query}
                        onChange={(e) => setFilters((f) => ({...f, query: e.target.value}))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                applyFilters();
                                onApplied?.()
                            }
                        }}
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.city')}</label>
                    <select
                        className="h-10 w-full border border-input bg-background rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.city_id ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, city_id: e.target.value || undefined}))}
                    >
                        <option value="">{t('labels.all')}</option>
                        {cities.map((c, idx) => (
                            <option key={`${c.id ?? c._id ?? (c as any).name ?? idx}`}
                                    value={c.id ?? c._id ?? ''}>{getRefName(c)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.owner')}</label>
                    <select
                        className="h-10 w-full border border-input bg-background rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.owner_id ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, owner_id: e.target.value || undefined}))}
                    >
                        <option value="">{t('labels.allOwners')}</option>
                        {(ownersData ?? []).map((u, idx) => {
                            const id = u.id ?? ''
                            const label = getUserLabel(u)
                            return <option key={id || idx} value={id}>{label}</option>
                        })}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.pilot')}</label>
                    <select
                        className="h-10 w-full border border-input bg-background rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.pilot_id ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, pilot_id: e.target.value || undefined}))}
                    >
                        <option value="">{t('labels.allPilots')}</option>
                        {(pilotsData ?? []).map((u, idx) => {
                            const id = u.id ?? ''
                            const label = getUserLabel(u)
                            return <option key={id || idx} value={id}>{label}</option>
                        })}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.fieldsOfActivity')}</label>
                    <select
                        className="h-10 w-full border border-input bg-background rounded-md px-2 text-sm min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.fields_of_activity ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, fields_of_activity: e.target.value || undefined}))}
                    >
                        <option value="">{t('labels.all')}</option>
                        {foaList.map((val) => (<option key={val} value={val}>{tFoa(val)}</option>))}
                    </select>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">{t('labels.modelYearRange')}</label>
                        <DualRangeSlider
                            min={1970}
                            max={new Date().getFullYear()}
                            step={1}
                            value={[filters.model_year_min ?? 1970, filters.model_year_max ?? new Date().getFullYear()]}
                            onValueChange={(vals) => setFilters((f) => ({
                                ...f,
                                model_year_min: Number(vals[0] as number),
                                model_year_max: Number(vals[1] as number)
                            }))}
                            label={(v) => (v != null ? Math.round(v) : '')}
                        />
                    </div>
                    <div>
                        <label
                            className="block text-xs text-muted-foreground mb-2">{t('labels.constructionYearRange')}</label>
                        <DualRangeSlider
                            min={1970}
                            max={new Date().getFullYear()}
                            step={1}
                            value={[filters.construction_year_min ?? 1970, filters.construction_year_max ?? new Date().getFullYear()]}
                            onValueChange={(vals) => setFilters((f) => ({
                                ...f,
                                construction_year_min: Number(vals[0] as number),
                                construction_year_max: Number(vals[1] as number)
                            }))}
                            label={(v) => (v != null ? Math.round(v) : '')}
                        />
                    </div>
                    <div>
                        <label
                            className="block text-xs text-muted-foreground mb-2">{t('labels.customsYearRange')}</label>
                        <DualRangeSlider
                            min={1970}
                            max={new Date().getFullYear()}
                            step={1}
                            value={[filters.customs_clearance_year_min ?? 1970, filters.customs_clearance_year_max ?? new Date().getFullYear()]}
                            onValueChange={(vals) => setFilters((f) => ({
                                ...f,
                                customs_clearance_year_min: Number(vals[0] as number),
                                customs_clearance_year_max: Number(vals[1] as number)
                            }))}
                            label={(v) => (v != null ? Math.round(v) : '')}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">{t('labels.priceRange')}</label>
                        <DualRangeSlider
                            min={0}
                            max={5000}
                            step={100}
                            value={[filters.price_min ?? 0, filters.price_max ?? 5000]}
                            onValueChange={(vals) => setFilters((f) => ({
                                ...f,
                                price_min: Number(vals[0] as number),
                                price_max: Number(vals[1] as number)
                            }))}
                            label={(v) => (v != null ? `${v} MAD` : '')}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">{t('labels.ratingRange')}</label>
                        <DualRangeSlider
                            min={0}
                            max={5}
                            step={1}
                            value={[filters.rating_min ?? 0, filters.rating_max ?? 5]}
                            onValueChange={(vals) => setFilters((f) => ({
                                ...f,
                                rating_min: Number((vals[0] as number).toFixed(1)),
                                rating_max: Number((vals[1] as number).toFixed(1))
                            }))}
                            label={(v) => (v != null ? (v as number).toFixed(1) : '')}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => {
                        applyFilters();
                        onApplied?.()
                    }}
                            className="inline-flex items-center h-10 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50"
                            disabled={isFetching}>{t('buttons.apply')}</button>
                    <button onClick={() => {
                        resetFilters();
                        onApplied?.()
                    }}
                            className="inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">{t('buttons.reset')}</button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => router.push('/admin/equipments/wizard')}
                        className="inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                        {t('buttons.wizard')}
                    </button>
                    <button
                        onClick={() => router.push('/admin/equipments/new')}
                        className="inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                        {t('buttons.new')}
                    </button>
                </div>
                <div className="md:hidden flex items-center gap-2">
                    <button
                        ref={filterToggleBtnRef}
                        onClick={() => setFiltersOpen(true)}
                        className="inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm"
                        aria-expanded={filtersOpen}
                        aria-controls="equipment-filters-sheet"
                    >
                        {t('buttons.filters')}{appliedCount > 0 ? <span
                        className="ms-2 inline-flex items-center justify-center text-xs rounded-full bg-slate-900 text-white px-2 py-0.5">{appliedCount}</span> : null}
                    </button>
                    <button
                        onClick={() => router.push('/admin/equipments/wizard')}
                        className="inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        {t('buttons.wizard')}
                    </button>
                    <button
                        onClick={() => router.push('/admin/equipments/new')}
                        className="inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        {t('buttons.new')}
                    </button>
                </div>
            </div>

            {/* Main grid: sidebar + content */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-4 items-start">
                <aside className="hidden lg:block sticky top-20 self-start rounded-lg border bg-card p-4"
                       aria-label={t('buttons.filters')}>
                    <FilterControls/>
                </aside>
                <section>

            {/* Table container */}
            <div className="rounded-lg border bg-card">
                {isError ? (
                    <div className="p-4">
                        <div className="text-sm text-red-600">{(error as Error)?.message || t('error')}</div>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                            {t('buttons.retry')}
                        </button>
                    </div>
                ) : items.length === 0 && !isFetching ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <div className="mb-2">{t('empty')}</div>
                        <button
                            onClick={resetFilters}
                            className="inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                        >{t('buttons.clearFilters')}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table - hidden on mobile */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                                <tr>
                                    <th className="text-start font-medium px-3 py-2 border-b">{t('table.title')}</th>
                                    <th className="text-start font-medium px-3 py-2 border-b">{t('table.brand')}</th>
                                    <th className="text-start font-medium px-3 py-2 border-b">{t('table.model')}</th>
                                    <th className="text-start font-medium px-3 py-2 border-b">{t('table.city')}</th>
                                    <th className="text-start font-medium px-3 py-2 border-b">{t('table.pricePerDay')}</th>
                                    <th className="text-start font-medium px-3 py-2 border-b">{t('table.available')}</th>
                                    <th className="text-start font-medium px-3 py-2 border-b">{t('table.actions')}</th>
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
                                            <td className="px-3 py-2 border-b">{getLocalizedName(it.brand) || it.brand_name || '-'}</td>
                                            <td className="px-3 py-2 border-b">{getLocalizedName(it.model) || it.model_name || '-'}</td>
                                            <td className="px-3 py-2 border-b">{getLocalizedName(it.city) || it.city_name || '-'}</td>
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
                                                <div className="flex items-center gap-2">
                                                    <button
                                                    onClick={() => {
                                                        const id = it.id as string | undefined
                                                        if (!id) return
                                                        try {
                                                            qc.setQueryData(['equipments', 'byId', id], it)
                                                        } catch {
                                                        }
                                                        router.push(`/admin/equipments/${encodeURIComponent(id)}/edit`)
                                                    }}
                                                    className="text-slate-600 hover:underline text-xs"
                                                >
                                                    {t('buttons.edit')}
                                                </button>
                                                    <button
                                                        onClick={() => {
                                                            const id = it.id as string | undefined
                                                            if (!id) return
                                                            router.push(`/admin/equipments/${encodeURIComponent(id)}/images`)
                                                        }}
                                                        className="text-slate-600 hover:underline text-xs"
                                                    >
                                                        {t('buttons.images')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const id = it.id as string | undefined
                                                            if (!id) return
                                                            setToDeleteId(id)
                                                            setToDeleteTitle((it.title as string) ?? '-')
                                                            setConfirmOpen(true)
                                                        }}
                                                        className="text-red-600 hover:underline text-xs"
                                                    >
                                                        {t('buttons.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards - hidden on desktop */}
                        <div className="md:hidden space-y-3">
                            {isFetching && items.length === 0 ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="border rounded-lg p-4 bg-white animate-pulse">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="h-5 w-40 bg-muted rounded mb-2"/>
                                                <div className="h-3 w-32 bg-muted rounded mb-1"/>
                                                <div className="h-3 w-28 bg-muted rounded"/>
                                            </div>
                                            <div className="h-6 w-16 bg-muted rounded"/>
                                        </div>
                                        <div className="space-y-1 mb-3">
                                            <div className="h-3 w-24 bg-muted rounded"/>
                                            <div className="h-3 w-20 bg-muted rounded"/>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div className="h-3 w-12 bg-muted rounded"/>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-12 bg-muted rounded"/>
                                                <div className="h-6 w-16 bg-muted rounded"/>
                                                <div className="h-6 w-16 bg-muted rounded"/>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : items.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">{t('empty')}</div>
                            ) : (
                                items.map((it, idx) => (
                                    <div key={(it.id as string) ?? idx} className="border rounded-lg p-4 bg-white">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-semibold text-base mb-2">{it.title ?? '-'}</div>
                                                <div
                                                    className="text-sm text-muted-foreground">{getLocalizedName(it.brand) || it.brand_name || '-'} • {getLocalizedName(it.model) || it.model_name || '-'}</div>
                                                <div
                                                    className="text-sm text-muted-foreground">{getLocalizedName(it.city) || it.city_name || '-'}</div>
                                            </div>
                                            {it.is_available ? (
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{t('table.yes')}</span>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{t('table.no')}</span>
                                            )}
                                        </div>
                                        <div className="mb-3 text-xs text-muted-foreground">
                                            <div>Price: {it.price_per_day != null ? `${it.price_per_day} MAD/day` : '-'}</div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div className="text-xs text-muted-foreground">
                                                Actions:
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        const id = it.id as string | undefined
                                                        if (!id) return
                                                        try {
                                                            qc.setQueryData(['equipments', 'byId', id], it)
                                                        } catch {
                                                        }
                                                        router.push(`/admin/equipments/${encodeURIComponent(id)}/edit`)
                                                    }}
                                                    className="text-xs px-2 py-1 rounded border"
                                                >
                                                    {t('buttons.edit')}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const id = it.id as string | undefined
                                                        if (!id) return
                                                        router.push(`/admin/equipments/${encodeURIComponent(id)}/images`)
                                                    }}
                                                    className="text-xs px-2 py-1 rounded border"
                                                >
                                                    {t('buttons.images')}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const id = it.id as string | undefined
                                                        if (!id) return
                                                        setToDeleteId(id)
                                                        setToDeleteTitle((it.title as string) ?? '-')
                                                        setConfirmOpen(true)
                                                    }}
                                                    className="text-xs px-2 py-1 rounded border text-red-600"
                                                >
                                                    {t('buttons.delete')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
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
                </section>
            </div>

            {filtersOpen && (
                <div className="lg:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFiltersOpen(false)}/>
                    <div
                        id="equipment-filters-sheet"
                        ref={filterSheetRef}
                        className="fixed z-50 inset-y-0 start-0 w-[90vw] max-w-sm bg-white border-e shadow-lg transition-transform motion-reduce:transition-none translate-x-0"
                        tabIndex={-1}
                        aria-label={t('buttons.filters')}
                    >
                        <div className="h-12 px-4 border-b flex items-center justify-between">
                            <div className="font-medium">{t('buttons.filters')}</div>
                            <button onClick={() => setFiltersOpen(false)}
                                    className="h-9 w-9 inline-flex items-center justify-center rounded-md border hover:bg-slate-50"
                                    aria-label="Close filters">×
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto h-[calc(100svh-3rem)]">
                            <FilterControls onApplied={() => setFiltersOpen(false)}/>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick add dialog */}
            {addOpen ? (
                <Portal>
                    <div role="dialog" aria-modal="true"
                         className="fixed inset-0 z-[100] flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onMouseDown={() => setAddOpen(false)}/>
                        <div className="relative z-10 w-full max-w-3xl rounded-lg border bg-background p-4 shadow-xl">
                            <div className="mb-2 text-base font-semibold">{t('newTitle')}</div>
                            <p className="text-sm text-muted-foreground mb-4">{t('newSubtitle')}</p>
                            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.title')}</label>
                                    <input
                                        className="h-9 border border-input bg-background rounded-md px-3 text-sm w-full"
                                        value={addForm.title}
                                        onChange={(e) => setAddForm((f) => ({...f, title: e.target.value}))}/>
                                    {addErrors.title ?
                                        <p className="text-xs text-red-600 mt-1">{addErrors.title}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.brand')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={addForm.brand_id}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setAddForm((f) => ({...f, brand_id: v, model_id: ''}))
                                        }}>
                                        <option value="">—</option>
                                        {brands.map((b, i) => (
                                            <option key={b.id ?? b._id ?? i}
                                                    value={b.id ?? b._id ?? ''}>{getRefName(b)}</option>
                                        ))}
                                    </select>
                                    {addErrors.brand_id ?
                                        <p className="text-xs text-red-600 mt-1">{addErrors.brand_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.model')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={addForm.model_id}
                                        onChange={(e) => setAddForm((f) => ({...f, model_id: e.target.value}))}
                                        disabled={!addForm.brand_id}>
                                        <option value="">—</option>
                                        {models.filter((m: any) => {
                                            const b = addForm.brand_id
                                            if (!b) return true
                                            const mid = typeof m?.brand_id === 'string' ? m.brand_id
                                                : typeof m?.brandId === 'string' ? m.brandId
                                                    : (m?.brand && typeof m.brand === 'object')
                                                        ? (typeof m.brand.id === 'string' ? m.brand.id : (typeof m.brand._id === 'string' ? m.brand._id : ''))
                                                        : ''
                                            return String(mid) === String(b)
                                        }).map((m, i) => (
                                            <option key={m.id ?? m._id ?? i}
                                                    value={m.id ?? m._id ?? ''}>{getRefName(m)}</option>
                                        ))}
                                    </select>
                                    {addErrors.model_id ?
                                        <p className="text-xs text-red-600 mt-1">{addErrors.model_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.category')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={addForm.category_id}
                                        onChange={(e) => setAddForm((f) => ({...f, category_id: e.target.value}))}>
                                        <option value="">—</option>
                                        {categories.map((c, i) => (
                                            <option key={c.id ?? c._id ?? i}
                                                    value={c.id ?? c._id ?? ''}>{getRefName(c)}</option>
                                        ))}
                                    </select>
                                    {addErrors.category_id ?
                                        <p className="text-xs text-red-600 mt-1">{addErrors.category_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.city')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={addForm.city_id}
                                        onChange={(e) => setAddForm((f) => ({...f, city_id: e.target.value}))}>
                                        <option value="">—</option>
                                        {cities.map((c, i) => (
                                            <option key={c.id ?? c._id ?? i}
                                                    value={c.id ?? c._id ?? ''}>{getRefName(c)}</option>
                                        ))}
                                    </select>
                                    {addErrors.city_id ?
                                        <p className="text-xs text-red-600 mt-1">{addErrors.city_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.fieldsOfActivity')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={addForm.fields_of_activity}
                                        onChange={(e) => setAddForm((f) => ({
                                            ...f,
                                            fields_of_activity: e.target.value
                                        }))}>
                                        <option value="">—</option>
                                        {foaList.map((v) => (
                                            <option key={v} value={v}>{tFoa(v)}</option>
                                        ))}
                                    </select>
                                    {addErrors.fields_of_activity ?
                                        <p className="text-xs text-red-600 mt-1">{addErrors.fields_of_activity}</p> : null}
                                    <p className="text-xs text-muted-foreground mt-1">{t('helpers.foaHint')}</p>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.owner')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={addForm.owner_id}
                                        onChange={(e) => setAddForm((f) => ({...f, owner_id: e.target.value}))}>
                                        <option value="">—</option>
                                        {(ownersData ?? []).map((u, idx) => {
                                            const id = u.id ?? ''
                                            const label = getUserLabel(u)
                                            return (
                                                <option key={id || idx} value={id}>{label}</option>
                                            )
                                        })}
                                    </select>
                                    {addErrors.owner_id ?
                                        <p className="text-xs text-red-600 mt-1">{addErrors.owner_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.pilot')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={addForm.pilot_id}
                                        onChange={(e) => setAddForm((f) => ({...f, pilot_id: e.target.value}))}>
                                        <option value="">—</option>
                                        {(pilotsData ?? []).map((u, idx) => {
                                            const id = u.id ?? ''
                                            const label = getUserLabel(u)
                                            return (
                                                <option key={id || idx} value={id}>{label}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.description')}</label>
                                    <textarea
                                        className="border border-input bg-background rounded-md px-3 py-2 text-sm w-full min-h-24"
                                        value={addForm.description}
                                        onChange={(e) => setAddForm((f) => ({...f, description: e.target.value}))}/>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.constructionYear')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={String(addForm.construction_year || '')}
                                        onChange={(e) => setAddForm((f) => ({
                                            ...f,
                                            construction_year: e.target.value ? Number(e.target.value) : ''
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {Array.from({length: new Date().getFullYear() - 1969}, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.customsYear')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={String(addForm.date_of_customs_clearance || '')}
                                        onChange={(e) => setAddForm((f) => ({
                                            ...f,
                                            date_of_customs_clearance: e.target.value ? Number(e.target.value) : ''
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {Array.from({length: new Date().getFullYear() - 1969}, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.modelYear')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={String(addForm.model_year || '')}
                                        onChange={(e) => setAddForm((f) => ({
                                            ...f,
                                            model_year: e.target.value ? Number(e.target.value) : ''
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {Array.from({length: new Date().getFullYear() - 1969}, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.pricePerDay')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={0}
                                            step="1"
                                            inputMode="decimal"
                                            pattern="[0-9]*"
                                            className="h-9 border border-input bg-background rounded-md px-3 pr-12 text-sm w-full"
                                            value={addForm.price_per_day}
                                            onChange={(e) => setAddForm((f) => ({...f, price_per_day: e.target.value}))}
                                        />
                                        <span
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MAD</span>
                                    </div>
                                    {addErrors.price_per_day ?
                                        <p className="text-xs text-red-600 mt-1">{addErrors.price_per_day}</p> : null}
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                                    <input id="add-available" type="checkbox" className="size-4"
                                           checked={addForm.is_available}
                                           onChange={(e) => setAddForm((f) => ({
                                               ...f,
                                               is_available: e.target.checked
                                           }))}/>
                                    <label htmlFor="add-available" className="text-sm">{t('table.available')}</label>
                                </div>

                                <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2 justify-end">
                                    <button type="button" onClick={() => setAddOpen(false)}
                                            className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                                        {t('buttons.cancel')}
                                    </button>
                                    <button type="submit" disabled={addSaving}
                                            className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50">
                                        {addSaving ? t('buttons.saving') : t('buttons.create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            ) : null}

            {/* Quick edit drawer */}
            {editOpen ? (
                <Portal>
                    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100]">
                        <div className="absolute inset-0 bg-black/40" onMouseDown={() => setEditOpen(false)}/>
                        <div
                            className="absolute right-0 top-0 h-full w-full max-w-lg bg-background border-l shadow-xl p-4 overflow-auto">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-base font-semibold">{t('editTitle')}</div>
                                <button onClick={() => setEditOpen(false)}
                                        className="text-sm text-muted-foreground hover:underline">{t('buttons.cancel')}</button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{t('editSubtitle')}</p>
                            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.title')}</label>
                                    <input
                                        className="h-9 border border-input bg-background rounded-md px-3 text-sm w-full"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm((f) => ({...f, title: e.target.value}))}/>
                                    {editErrors.title ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.title}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.brand')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.brand_id}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setEditForm((f) => ({...f, brand_id: v, model_id: ''}));
                                            setEditErrors((er) => ({...er, brand_id: ''}))
                                        }}>
                                        <option value="">—</option>
                                        {brands.map((b, i) => (
                                            <option key={b.id ?? b._id ?? i}
                                                    value={b.id ?? b._id ?? ''}>{getRefName(b)}</option>
                                        ))}
                                    </select>
                                    {editErrors.brand_id ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.brand_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.model')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.model_id}
                                        onChange={(e) => {
                                            setEditForm((f) => ({...f, model_id: e.target.value}));
                                            setEditErrors((er) => ({...er, model_id: ''}))
                                        }} disabled={!editForm.brand_id}>
                                        <option value="">—</option>
                                        {models.filter((m: any) => {
                                            const b = editForm.brand_id
                                            if (!b) return true
                                            const mid = typeof m?.brand_id === 'string' ? m.brand_id
                                                : typeof m?.brandId === 'string' ? m.brandId
                                                    : (m?.brand && typeof m.brand === 'object')
                                                        ? (typeof m.brand.id === 'string' ? m.brand.id : (typeof m.brand._id === 'string' ? m.brand._id : ''))
                                                        : ''
                                            return String(mid) === String(b)
                                        }).map((m, i) => (
                                            <option key={m.id ?? m._id ?? i}
                                                    value={m.id ?? m._id ?? ''}>{getRefName(m)}</option>
                                        ))}
                                    </select>
                                    {editErrors.model_id ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.model_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.category')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.category_id}
                                        onChange={(e) => {
                                            setEditForm((f) => ({...f, category_id: e.target.value}));
                                            setEditErrors((er) => ({...er, category_id: ''}))
                                        }}>
                                        <option value="">—</option>
                                        {categories.map((c, i) => (
                                            <option key={c.id ?? c._id ?? i}
                                                    value={c.id ?? c._id ?? ''}>{getRefName(c)}</option>
                                        ))}
                                    </select>
                                    {editErrors.category_id ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.category_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.city')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.city_id}
                                        onChange={(e) => {
                                            setEditForm((f) => ({...f, city_id: e.target.value}));
                                            setEditErrors((er) => ({...er, city_id: ''}))
                                        }}>
                                        <option value="">—</option>
                                        {cities.map((c, i) => (
                                            <option key={c.id ?? c._id ?? i}
                                                    value={c.id ?? c._id ?? ''}>{getRefName(c)}</option>
                                        ))}
                                    </select>
                                    {editErrors.city_id ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.city_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.fieldsOfActivity')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.fields_of_activity}
                                        onChange={(e) => {
                                            setEditForm((f) => ({...f, fields_of_activity: e.target.value}));
                                            setEditErrors((er) => ({...er, fields_of_activity: ''}))
                                        }}>
                                        <option value="">—</option>
                                        {foaList.map((v) => (
                                            <option key={v} value={v}>{tFoa(v)}</option>
                                        ))}
                                    </select>
                                    {editErrors.fields_of_activity ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.fields_of_activity}</p> : null}
                                    <p className="text-xs text-muted-foreground mt-1">{t('helpers.foaHint')}</p>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.owner')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.owner_id}
                                        onChange={(e) => {
                                            setEditForm((f) => ({...f, owner_id: e.target.value}));
                                            setEditErrors((er) => ({...er, owner_id: ''}))
                                        }}>
                                        <option value="">—</option>
                                        {(ownersData ?? []).map((u, idx) => {
                                            const id = u.id ?? ''
                                            const label = getUserLabel(u as any)
                                            return (
                                                <option key={id || idx} value={id}>{label}</option>
                                            )
                                        })}
                                    </select>
                                    {editErrors.owner_id ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.owner_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.pilot')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.pilot_id}
                                        onChange={(e) => setEditForm((f) => ({...f, pilot_id: e.target.value}))}>
                                        <option value="">—</option>
                                        {(pilotsData ?? []).map((u, idx) => {
                                            const id = u.id ?? ''
                                            const label = getUserLabel(u as any)
                                            return (
                                                <option key={id || idx} value={id}>{label}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.description')}</label>
                                    <textarea
                                        className="border border-input bg-background rounded-md px-3 py-2 text-sm w-full min-h-24"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm((f) => ({...f, description: e.target.value}))}/>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.constructionYear')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={String(editForm.construction_year || '')}
                                        onChange={(e) => setEditForm((f) => ({
                                            ...f,
                                            construction_year: e.target.value ? Number(e.target.value) : ''
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {Array.from({length: new Date().getFullYear() - 1969}, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.customsYear')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={String(editForm.date_of_customs_clearance || '')}
                                        onChange={(e) => setEditForm((f) => ({
                                            ...f,
                                            date_of_customs_clearance: e.target.value ? Number(e.target.value) : ''
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {Array.from({length: new Date().getFullYear() - 1969}, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.modelYear')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={String(editForm.model_year || '')}
                                        onChange={(e) => setEditForm((f) => ({
                                            ...f,
                                            model_year: e.target.value ? Number(e.target.value) : ''
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {Array.from({length: new Date().getFullYear() - 1969}, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.pricePerDay')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={0}
                                            step="1"
                                            inputMode="decimal"
                                            pattern="[0-9]*"
                                            className="h-9 border border-input bg-background rounded-md px-3 pr-12 text-sm w-full"
                                            value={editForm.price_per_day}
                                            onChange={(e) => setEditForm((f) => ({
                                                ...f,
                                                price_per_day: e.target.value
                                            }))}
                                        />
                                        <span
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MAD</span>
                                    </div>
                                    {editErrors.price_per_day ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.price_per_day}</p> : null}
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                                    <input id="edit-available" type="checkbox" className="size-4"
                                           checked={editForm.is_available}
                                           onChange={(e) => setEditForm((f) => ({
                                               ...f,
                                               is_available: e.target.checked
                                           }))}/>
                                    <label htmlFor="edit-available" className="text-sm">{t('table.available')}</label>
                                </div>

                                <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2 pt-2">
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setEditOpen(false)}
                                                className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                                            {t('buttons.cancel')}
                                        </button>
                                        <button type="submit" disabled={editSaving}
                                                className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50">
                                            {editSaving ? t('buttons.saving') : t('buttons.update')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            ) : null}

            {/* Confirm delete dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={t('buttons.confirmDelete') || 'Are you sure?'}
                description={`This action cannot be undone. Deleting “${toDeleteTitle ?? ''}” will permanently remove this equipment.`}
                confirmLabel={t('buttons.delete')}
                cancelLabel={t('buttons.cancel')}
                onConfirm={doDelete}
                verifyText={toDeleteTitle ?? ''}
                verifyPlaceholder={t('dialogs.typeToConfirmPlaceholder')}
                verifyMessage={t('dialogs.typeToConfirmMessage')}
            />
        </div>
    )
}
