"use client"

import React from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {refsService} from '@/services/refs'
import {useLocale, useTranslations} from 'next-intl'
import {useRouter} from '@/i18n/navigation'
import {useParams, useSearchParams} from 'next/navigation'
import {toast} from 'sonner'
import {z} from 'zod'

interface RefItem {
    id?: string;
    _id?: string;
    name?: string
}

interface UserItem {
    id?: string;
    name?: string;
    username?: string;
    email?: string
}

function getUserLabel(u?: UserItem): string {
    if (!u) return '-'
    return u.name || u.username || u.email || '-'
}

export default function EditEquipmentPage() {
    const t = useTranslations('admin.equipments')
    const router = useRouter()
    const params = useParams<{ equipment_id: string }>()
    const equipmentId = params?.equipment_id as string
    const qc = useQueryClient()
    const searchParams = useSearchParams()
    const locale = useLocale()
    const getRefName = React.useCallback((it: any): string => {
        if (typeof it === 'string') return it
        if (!it || typeof it !== 'object') return '-'
        const key = locale === 'ar' ? 'name_ar' : (locale === 'fr' ? 'name_fr' : 'name_en')
        const val = (it as any)[key] ?? (it as any).name ?? (it as any).label ?? (it as any).title
        return typeof val === 'string' && val.trim().length > 0 ? val : '-'
    }, [locale])

    // Reference data
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
    const {data: citiesData} = useQuery({
        queryKey: ['refs', 'cities'],
        queryFn: () => refsService.getCities().then((r) => r.data).catch(() => [] as unknown[]),
        staleTime: 60_000,
    })
    const {data: categoriesData} = useQuery({
        queryKey: ['refs', 'categories', locale],
        queryFn: () => refsService.getCategories().then((r) => r.data).catch(() => [] as unknown[]),
        staleTime: 60_000,
    })
    const {data: foaData} = useQuery<string[]>({
        queryKey: ['refs', 'foa'],
        queryFn: () => refsService.getFoa().then((r) => r.data).catch(() => [] as string[]),
        staleTime: 60_000,
    })

    // Owners list
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

    // Pilots list
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

    const [saving, setSaving] = React.useState(false)
    const [form, setForm] = React.useState({
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
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    function validate(): boolean {
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
        const res = schema.safeParse(form)
        if (res.success) {
            setErrors({})
            return true
        }
        const e: Record<string, string> = {}
        for (const issue of res.error.issues) {
            const path = issue.path[0] as string
            e[path] = issue.message || reqMsg
        }
        setErrors(e)
        return false
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!equipmentId) {
            toast.error('Missing equipment id')
            return
        }
        // Zod validation
        if (!validate()) return
        const payload = {
            id: equipmentId,
            title: form.title,
            brand_id: form.brand_id,
            model_id: form.model_id,
            category_id: form.category_id,
            city_id: form.city_id,
            owner_id: form.owner_id,
            pilot_id: form.pilot_id,
            fields_of_activity: form.fields_of_activity,
            description: form.description,
            is_available: !!form.is_available,
            model_year: Number(form.model_year),
            construction_year: Number(form.construction_year),
            date_of_customs_clearance: Number(form.date_of_customs_clearance),
            price_per_day: Number(form.price_per_day),
        }
        setSaving(true)
        try {
            const res = await fetch('/api/equipments/update', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const errText = await res.text().catch(() => '')
                toast.error(errText || 'Failed to update equipment')
                return
            }
            toast.success(t('updated'))
            try {
                await qc.invalidateQueries({queryKey: ['equipments', 'filter']})
            } catch {
            }
            router.replace('/admin/equipments')
        } catch {
            toast.error('Unexpected error')
        } finally {
            setSaving(false)
        }
    }

    const brands: RefItem[] = Array.isArray(brandsData) ? (brandsData as RefItem[]) : []
    const models: RefItem[] = Array.isArray(modelsData) ? (modelsData as RefItem[]) : []
    const cities: RefItem[] = Array.isArray(citiesData) ? (citiesData as RefItem[]) : []
    const categories: RefItem[] = Array.isArray(categoriesData) ? (categoriesData as RefItem[]) : []
    const foa: string[] = Array.isArray(foaData) ? foaData : []

    // Prefill from React Query cache first; fallback to URL payload if cache missing
    React.useEffect(() => {
        try {
            const cached = qc.getQueryData(['equipments', 'byId', equipmentId]) as Record<string, unknown> | undefined
            if (cached) {
                const brandObj = cached.brand && typeof cached.brand === 'object' ? (cached.brand as {
                    id?: unknown
                }) : undefined
                const modelObj = cached.model && typeof cached.model === 'object' ? (cached.model as {
                    id?: unknown
                }) : undefined
                const cityObj = cached.city && typeof cached.city === 'object' ? (cached.city as {
                    id?: unknown
                }) : undefined
                const ownerObj = cached.owner && typeof cached.owner === 'object' ? (cached.owner as {
                    id?: unknown
                }) : undefined
                const pilotObj = cached.pilot && typeof cached.pilot === 'object' ? (cached.pilot as {
                    id?: unknown
                }) : undefined
                const categoryObj = cached.category && typeof cached.category === 'object' ? (cached.category as {
                    id?: unknown
                }) : undefined

                setForm((prev) => ({
                    ...prev,
                    title: typeof cached.title === 'string' ? cached.title : prev.title,
                    brand_id: typeof cached.brand_id === 'string' ? cached.brand_id : (typeof brandObj?.id === 'string' ? (brandObj.id as string) : prev.brand_id),
                    model_id: typeof cached.model_id === 'string' ? cached.model_id : (typeof modelObj?.id === 'string' ? (modelObj.id as string) : prev.model_id),
                    category_id: typeof cached.category_id === 'string' ? cached.category_id : (typeof categoryObj?.id === 'string' ? (categoryObj.id as string) : prev.category_id),
                    city_id: typeof cached.city_id === 'string' ? cached.city_id : (typeof cityObj?.id === 'string' ? (cityObj.id as string) : prev.city_id),
                    owner_id: typeof cached.owner_id === 'string' ? cached.owner_id : (typeof ownerObj?.id === 'string' ? (ownerObj.id as string) : prev.owner_id),
                    pilot_id: typeof cached.pilot_id === 'string' ? cached.pilot_id : (typeof pilotObj?.id === 'string' ? (pilotObj.id as string) : prev.pilot_id),
                    fields_of_activity: typeof cached.fields_of_activity === 'string' ? cached.fields_of_activity : prev.fields_of_activity,
                    description: typeof cached.description === 'string' ? cached.description : prev.description,
                    is_available: typeof cached.is_available === 'boolean' ? (cached.is_available as boolean) : prev.is_available,
                    model_year: typeof cached.model_year === 'number' ? (cached.model_year as number) : prev.model_year,
                    construction_year: typeof cached.construction_year === 'number' ? (cached.construction_year as number) : prev.construction_year,
                    date_of_customs_clearance: typeof cached.date_of_customs_clearance === 'number' ? (cached.date_of_customs_clearance as number) : prev.date_of_customs_clearance,
                    price_per_day: typeof cached.price_per_day === 'number' ? (cached.price_per_day as number) : prev.price_per_day,
                }))
                return
            }

            // Fallback to URL payload if no cache snapshot available
            const encoded = searchParams?.get('data')
            if (!encoded) return
            const json = decodeURIComponent(escape(atob(encoded)))
            const obj = JSON.parse(json) as Record<string, unknown>
            const brandObj = obj.brand && typeof obj.brand === 'object' ? (obj.brand as { id?: unknown }) : undefined
            const modelObj = obj.model && typeof obj.model === 'object' ? (obj.model as { id?: unknown }) : undefined
            const cityObj = obj.city && typeof obj.city === 'object' ? (obj.city as { id?: unknown }) : undefined
            const ownerObj = obj.owner && typeof obj.owner === 'object' ? (obj.owner as { id?: unknown }) : undefined
            const pilotObj = obj.pilot && typeof obj.pilot === 'object' ? (obj.pilot as { id?: unknown }) : undefined
            const categoryObj = obj.category && typeof obj.category === 'object' ? (obj.category as {
                id?: unknown
            }) : undefined

            setForm((prev) => ({
                ...prev,
                title: typeof obj.title === 'string' ? (obj.title as string) : prev.title,
                brand_id: typeof obj.brand_id === 'string' ? (obj.brand_id as string) : (typeof brandObj?.id === 'string' ? (brandObj.id as string) : prev.brand_id),
                model_id: typeof obj.model_id === 'string' ? (obj.model_id as string) : (typeof modelObj?.id === 'string' ? (modelObj.id as string) : prev.model_id),
                category_id: typeof obj.category_id === 'string' ? (obj.category_id as string) : (typeof categoryObj?.id === 'string' ? (categoryObj.id as string) : prev.category_id),
                city_id: typeof obj.city_id === 'string' ? (obj.city_id as string) : (typeof cityObj?.id === 'string' ? (cityObj.id as string) : prev.city_id),
                owner_id: typeof obj.owner_id === 'string' ? (obj.owner_id as string) : (typeof ownerObj?.id === 'string' ? (ownerObj.id as string) : prev.owner_id),
                pilot_id: typeof obj.pilot_id === 'string' ? (obj.pilot_id as string) : (typeof pilotObj?.id === 'string' ? (pilotObj.id as string) : prev.pilot_id),
                fields_of_activity: typeof obj.fields_of_activity === 'string' ? (obj.fields_of_activity as string) : prev.fields_of_activity,
                description: typeof obj.description === 'string' ? (obj.description as string) : prev.description,
                is_available: typeof obj.is_available === 'boolean' ? (obj.is_available as boolean) : prev.is_available,
                model_year: typeof obj.model_year === 'number' ? (obj.model_year as number) : prev.model_year,
                construction_year: typeof obj.construction_year === 'number' ? (obj.construction_year as number) : prev.construction_year,
                date_of_customs_clearance: typeof obj.date_of_customs_clearance === 'number' ? (obj.date_of_customs_clearance as number) : prev.date_of_customs_clearance,
                price_per_day: typeof obj.price_per_day === 'number' ? (obj.price_per_day as number) : prev.price_per_day,
            }))
        } catch {
            // ignore malformed payload
        }
    }, [equipmentId, qc])

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t('editTitle')}</h1>
                <p className="text-sm text-muted-foreground">{t('editSubtitle')}</p>
            </div>

            <form onSubmit={onSubmit} className="rounded-lg border bg-card p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.title')}</label>
                    <input className="h-9 border border-input bg-background rounded-md px-3 text-sm w-full"
                           value={form.title}
                           onChange={(e) => setForm((f) => ({...f, title: e.target.value}))}/>
                    {errors.title ? <p className="text-xs text-red-600 mt-1">{errors.title}</p> : null}
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.brand')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.brand_id}
                            onChange={(e) => setForm((f) => ({...f, brand_id: e.target.value}))}>
                        <option value="">—</option>
                        {brands.map((b, i) => (
                            <option key={b.id ?? b._id ?? i} value={b.id ?? b._id ?? ''}>{getRefName(b)}</option>
                        ))}
                    </select>
                    {errors.brand_id ? <p className="text-xs text-red-600 mt-1">{errors.brand_id}</p> : null}
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.model')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.model_id}
                            onChange={(e) => setForm((f) => ({...f, model_id: e.target.value}))}>
                        <option value="">—</option>
                        {models.map((m, i) => (
                            <option key={m.id ?? m._id ?? i} value={m.id ?? m._id ?? ''}>{getRefName(m)}</option>
                        ))}
                    </select>
                    {errors.model_id ? <p className="text-xs text-red-600 mt-1">{errors.model_id}</p> : null}
                </div>
                <div>
                    <label
                        className="block text-xs text-muted-foreground mb-1">{t('labels.category') || 'Category'}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.category_id}
                            onChange={(e) => setForm((f) => ({...f, category_id: e.target.value}))}>
                        <option value="">—</option>
                        {categories.map((c, i) => (
                            <option key={c.id ?? c._id ?? i} value={c.id ?? c._id ?? ''}>{getRefName(c)}</option>
                        ))}
                    </select>
                    {errors.category_id ? <p className="text-xs text-red-600 mt-1">{errors.category_id}</p> : null}
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.city')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.city_id}
                            onChange={(e) => setForm((f) => ({...f, city_id: e.target.value}))}>
                        <option value="">—</option>
                        {cities.map((c, i) => (
                            <option key={c.id ?? c._id ?? i} value={c.id ?? c._id ?? ''}>{getRefName(c)}</option>
                        ))}
                    </select>
                    {errors.city_id ? <p className="text-xs text-red-600 mt-1">{errors.city_id}</p> : null}
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.fieldsOfActivity')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.fields_of_activity}
                            onChange={(e) => setForm((f) => ({...f, fields_of_activity: e.target.value}))}>
                        <option value="">—</option>
                        {foa.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    {errors.fields_of_activity ?
                        <p className="text-xs text-red-600 mt-1">{errors.fields_of_activity}</p> : null}
                    <p className="text-xs text-muted-foreground mt-1">{t('helpers.foaHint') || 'Select the main activity this equipment is used for.'}</p>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.owner')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.owner_id}
                            onChange={(e) => setForm((f) => ({...f, owner_id: e.target.value}))}>
                        <option value="">—</option>
                        {(ownersData ?? []).map((u, idx) => {
                            const id = u.id ?? ''
                            const label = getUserLabel(u)
                            return (
                                <option key={id || idx} value={id}>{label}</option>
                            )
                        })}
                    </select>
                    {errors.owner_id ? <p className="text-xs text-red-600 mt-1">{errors.owner_id}</p> : null}
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.pilot')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.pilot_id}
                            onChange={(e) => setForm((f) => ({...f, pilot_id: e.target.value}))}>
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
                        className="block text-xs text-muted-foreground mb-1">{t('labels.description') || 'Description'}</label>
                    <textarea className="border border-input bg-background rounded-md px-3 py-2 text-sm w-full min-h-24"
                              value={form.description}
                              onChange={(e) => setForm((f) => ({...f, description: e.target.value}))}/>
                </div>
                <div>
                    <label
                        className="block text-xs text-muted-foreground mb-1">{t('labels.constructionYear') || 'Construction year'}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                        value={String(form.construction_year || '')}
                        onChange={(e) => setForm((f) => ({
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
                        className="block text-xs text-muted-foreground mb-1">{t('labels.customsYear') || 'Customs clearance year'}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                        value={String(form.date_of_customs_clearance || '')}
                        onChange={(e) => setForm((f) => ({
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
                        className="block text-xs text-muted-foreground mb-1">{t('labels.modelYear') || 'Model year'}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                        value={String(form.model_year || '')}
                        onChange={(e) => setForm((f) => ({
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
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.pricePerDay')}</label>
                    <div className="relative">
                        <input
                            type="number"
                            min={0}
                            step="1"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            className="h-9 border border-input bg-background rounded-md px-3 pr-12 text-sm w-full"
                            value={form.price_per_day}
                            onChange={(e) => setForm((f) => ({...f, price_per_day: e.target.value}))}
                        />
                        <span
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MAD</span>
                    </div>
                    {errors.price_per_day ? <p className="text-xs text-red-600 mt-1">{errors.price_per_day}</p> : null}
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                    <input id="available" type="checkbox" className="size-4" checked={form.is_available}
                           onChange={(e) => setForm((f) => ({...f, is_available: e.target.checked}))}/>
                    <label htmlFor="available" className="text-sm">{t('table.available')}</label>
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
                    <button type="submit" disabled={saving}
                            className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50">
                        {saving ? t('buttons.saving') : t('buttons.update')}
                    </button>
                    <button type="button" onClick={() => router.replace('/admin/equipments')}
                            className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                        {t('buttons.cancel')}
                    </button>
                </div>
            </form>
        </div>
    )
}