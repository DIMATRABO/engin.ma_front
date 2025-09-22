'use client'

import React from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {refsService} from '@/services/refs'
import {useLocale, useTranslations} from 'next-intl'
import {useRouter} from '@/i18n/navigation'
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

export default function NewEquipmentPage() {
    const t = useTranslations('admin.equipments')
    const tFoa = useTranslations('admin.equipments.foa')
    const router = useRouter()
    const qc = useQueryClient()
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

    // Owners list for owner dropdown
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

    // Pilots list for pilot dropdown
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
        if (!validate()) return
        const payload = {
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
            const res = await fetch('/api/equipments', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const raw = await res.text().catch(() => '')
                let parsed: any = null
                try {
                    parsed = raw ? JSON.parse(raw) : null
                } catch {
                }
                if (parsed && parsed.errors && typeof parsed.errors === 'object') {
                    const fieldErrors: Record<string, string> = {}
                    for (const [k, v] of Object.entries(parsed.errors as Record<string, unknown>)) {
                        fieldErrors[String(k)] = typeof v === 'string' ? v : t('validation.required')
                    }
                    setErrors(fieldErrors)
                }
                toast.error(parsed?.message || raw || 'Failed to create equipment')
                return
            }
            toast.success(t('created'))
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

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t('newTitle')}</h1>
                <p className="text-sm text-muted-foreground">{t('newSubtitle')}</p>
            </div>

            <form onSubmit={onSubmit} className="rounded-lg border bg-card p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.title')}</label>
                    <input className="h-9 border border-input bg-background rounded-md px-3 text-sm w-full"
                           value={form.title}
                           onChange={(e) => {
                               setForm((f) => ({...f, title: e.target.value}));
                               setErrors((er) => ({...er, title: ''}))
                           }}/>
                    {errors.title ? <p className="text-xs text-red-600 mt-1">{errors.title}</p> : null}
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.brand')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.brand_id}
                            onChange={(e) => {
                                const v = e.target.value;
                                setForm((f) => ({...f, brand_id: v, model_id: ''}));
                                setErrors((er) => ({...er, brand_id: ''}))
                            }}>
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
                            onChange={(e) => {
                                setForm((f) => ({...f, model_id: e.target.value}));
                                setErrors((er) => ({...er, model_id: ''}))
                            }} disabled={!form.brand_id}>
                        <option value="">—</option>
                        {models.filter((m: any) => {
                            const b = form.brand_id
                            if (!b) return true
                            const mid = typeof m?.brand_id === 'string' ? m.brand_id
                                : typeof m?.brandId === 'string' ? m.brandId
                                    : (m?.brand && typeof m.brand === 'object')
                                        ? (typeof m.brand.id === 'string' ? m.brand.id : (typeof m.brand._id === 'string' ? m.brand._id : ''))
                                        : ''
                            return String(mid) === String(b)
                        }).map((m, i) => (
                            <option key={m.id ?? m._id ?? i} value={m.id ?? m._id ?? ''}>{getRefName(m)}</option>
                        ))}
                    </select>
                    {errors.model_id ? <p className="text-xs text-red-600 mt-1">{errors.model_id}</p> : null}
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.category')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.category_id}
                            onChange={(e) => {
                                setForm((f) => ({...f, category_id: e.target.value}));
                                setErrors((er) => ({...er, category_id: ''}))
                            }}>
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
                            onChange={(e) => {
                                setForm((f) => ({...f, city_id: e.target.value}));
                                setErrors((er) => ({...er, city_id: ''}))
                            }}>
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
                            onChange={(e) => {
                                setForm((f) => ({...f, fields_of_activity: e.target.value}));
                                setErrors((er) => ({...er, fields_of_activity: ''}))
                            }}>
                        <option value="">—</option>
                        {foa.map((v) => (
                            <option key={v} value={v}>{tFoa(v)}</option>
                        ))}
                    </select>
                    {errors.fields_of_activity ?
                        <p className="text-xs text-red-600 mt-1">{errors.fields_of_activity}</p> : null}
                    <p className="text-xs text-muted-foreground mt-1">{t('helpers.foaHint')}</p>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.owner')}</label>
                    <select className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                            value={form.owner_id}
                            onChange={(e) => {
                                setForm((f) => ({...f, owner_id: e.target.value}));
                                setErrors((er) => ({...er, owner_id: ''}))
                            }}>
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
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.description')}</label>
                    <textarea className="border border-input bg-background rounded-md px-3 py-2 text-sm w-full min-h-24"
                              value={form.description}
                              onChange={(e) => setForm((f) => ({...f, description: e.target.value}))}/>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.constructionYear')}</label>
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
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.customsYear')}</label>
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
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.modelYear')}</label>
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
                        {saving ? t('buttons.saving') : t('buttons.create')}
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
