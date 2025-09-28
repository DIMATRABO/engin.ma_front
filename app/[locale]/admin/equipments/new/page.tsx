"use client"

import React from 'react'
import {useTranslations, useLocale} from 'next-intl'
import {useRouter} from '@/i18n/navigation'
import {useQuery} from '@tanstack/react-query'
import {refsService} from '@/services/refs'
import {toast} from 'sonner'

function getUserLabel(u: any): string {
    if (!u) return '-'
    return u.name || u.username || u.email || '-'
}

export default function EquipmentNewPage() {
    const t = useTranslations('admin.equipments')
    const router = useRouter()
    const locale = useLocale()

    const brandsQ = useQuery({
        queryKey: ['refs', 'brands'],
        queryFn: async () => {
            const res = await refsService.getBrands()
            return Array.isArray(res.data) ? res.data as any[] : []
        },
        staleTime: 60_000,
    })
    const modelsQ = useQuery({
        queryKey: ['refs', 'models'],
        queryFn: async () => {
            const res = await refsService.getModels()
            return Array.isArray(res.data) ? res.data as any[] : []
        },
        staleTime: 60_000,
    })
    const citiesQ = useQuery({
        queryKey: ['refs', 'cities'],
        queryFn: async () => {
            const res = await refsService.getCities()
            return Array.isArray(res.data) ? res.data as any[] : []
        },
        staleTime: 60_000,
    })
    const categoriesQ = useQuery({
        queryKey: ['refs', 'categories', locale],
        queryFn: async () => {
            const res = await refsService.getCategories()
            return Array.isArray(res.data) ? res.data as any[] : []
        },
        staleTime: 60_000,
    })
    const foaQ = useQuery({
        queryKey: ['refs', 'foa'],
        queryFn: async () => {
            const res = await refsService.getFoa()
            return Array.isArray(res.data) ? res.data as string[] : []
        },
        staleTime: 60_000,
    })
    const ownersQ = useQuery({
        queryKey: ['owners', 'list'],
        queryFn: async () => {
            const res = await fetch('/api/owners')
            if (!res.ok) throw new Error(await res.text().catch(() => 'Failed to load owners'))
            const raw = await res.json().catch(() => [])
            return Array.isArray(raw) ? raw : []
        },
        staleTime: 60_000,
    })
    const pilotsQ = useQuery({
        queryKey: ['pilotes', 'list'],
        queryFn: async () => {
            const res = await fetch('/api/pilotes')
            if (!res.ok) throw new Error(await res.text().catch(() => 'Failed to load pilots'))
            const raw = await res.json().catch(() => [])
            return Array.isArray(raw) ? raw : []
        },
        staleTime: 60_000,
    })

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

    const canSubmit =
        form.title.trim() && form.brand_id && form.model_id && form.category_id && form.city_id && form.owner_id && form.pilot_id && form.fields_of_activity && form.description.trim() && String(form.model_year) && String(form.construction_year) && String(form.date_of_customs_clearance) && String(form.price_per_day)

    function years(): number[] {
        const now = new Date().getFullYear()
        return Array.from({length: now - 1969}, (_, i) => now - i)
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!canSubmit) return
        const payload: Record<string, any> = {
            id: crypto.randomUUID(),
            title: form.title.trim(),
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
        try {
            const res = await fetch('/api/equipments', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const msg = await res.text().catch(() => '')
                toast.error(msg || 'Failed to create equipment')
                return
            }
            toast.success(t('created'))
            router.replace('/admin/equipments')
        } catch (err: any) {
            toast.error(err?.message || 'Failed to create equipment')
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">{t('newTitle')}</h1>
                <p className="text-sm text-muted-foreground">{t('newSubtitle')}</p>
            </div>

            <form onSubmit={onSubmit} className="rounded-lg border bg-card p-4 grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.title')}</label>
                    <input
                        className="h-9 w-full border border-input bg-background rounded-md px-3 text-sm"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({...f, title: e.target.value}))}
                    />
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.brand')}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={form.brand_id}
                        onChange={(e) => setForm((f) => ({...f, brand_id: e.target.value, model_id: ''}))}
                    >
                        <option value="">—</option>
                        {brandsQ.data?.map((b: any, i: number) => (
                            <option key={(b.id || b._id || i) as any}
                                    value={(b.id || b._id) as string}>{b.name ?? '-'}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.model')}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={form.model_id}
                        onChange={(e) => setForm((f) => ({...f, model_id: e.target.value}))}
                    >
                        <option value="">—</option>
                        {modelsQ.data?.filter((m: any) => {
                            const b = form.brand_id
                            if (!b) return true
                            const mid = typeof m?.brand_id === 'string' ? m.brand_id
                                : typeof m?.brandId === 'string' ? m.brandId
                                    : (m?.brand && typeof m.brand === 'object')
                                        ? (typeof m.brand.id === 'string' ? m.brand.id : (typeof m.brand._id === 'string' ? m.brand._id : ''))
                                        : ''
                            return String(mid) === String(b)
                        }).map((m: any, i: number) => (
                            <option key={(m.id || m._id || i) as any}
                                    value={(m.id || m._id) as string}>{m.name ?? '-'}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        className="block text-xs text-muted-foreground mb-1">{t('labels.category') || 'Category'}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={form.category_id}
                        onChange={(e) => setForm((f) => ({...f, category_id: e.target.value}))}
                    >
                        <option value="">—</option>
                        {categoriesQ.data?.map((c: any, i: number) => (
                            <option key={(c.id || c._id || i) as any}
                                    value={(c.id || c._id) as string}>{c.name ?? '-'}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('table.city')}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={form.city_id}
                        onChange={(e) => setForm((f) => ({...f, city_id: e.target.value}))}
                    >
                        <option value="">—</option>
                        {citiesQ.data?.map((c: any, i: number) => (
                            <option key={(c.id || c._id || i) as any}
                                    value={(c.id || c._id) as string}>{c.name ?? '-'}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.owner')}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={form.owner_id}
                        onChange={(e) => setForm((f) => ({...f, owner_id: e.target.value}))}
                    >
                        <option value="">—</option>
                        {(ownersQ.data ?? []).map((u: any, idx: number) => {
                            const id = u.id || u._id || ''
                            const label = getUserLabel(u)
                            return <option key={(id || idx) as any} value={id as string}>{label}</option>
                        })}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.pilot')}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={form.pilot_id}
                        onChange={(e) => setForm((f) => ({...f, pilot_id: e.target.value}))}
                    >
                        <option value="">—</option>
                        {(pilotsQ.data ?? []).map((u: any, idx: number) => {
                            const id = u.id || u._id || ''
                            const label = getUserLabel(u)
                            return <option key={(id || idx) as any} value={id as string}>{label}</option>
                        })}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.fieldsOfActivity')}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={form.fields_of_activity}
                        onChange={(e) => setForm((f) => ({...f, fields_of_activity: e.target.value}))}
                    >
                        <option value="">—</option>
                        {foaQ.data?.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">{t('helpers.foaHint') || ''}</p>
                </div>

                <div className="md:col-span-2">
                    <label
                        className="block text-xs text-muted-foreground mb-1">{t('labels.description') || 'Description'}</label>
                    <textarea
                        className="border border-input bg-background rounded-md px-3 py-2 text-sm w-full min-h-24"
                        value={form.description}
                        onChange={(e) => setForm((f) => ({...f, description: e.target.value}))}
                    />
                </div>

                <div>
                    <label
                        className="block text-xs text-muted-foreground mb-1">{t('labels.constructionYear') || 'Construction year'}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={String(form.construction_year || '')}
                        onChange={(e) => setForm((f) => ({
                            ...f,
                            construction_year: e.target.value ? Number(e.target.value) : ''
                        }))}
                    >
                        <option value="">—</option>
                        {years().map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        className="block text-xs text-muted-foreground mb-1">{t('labels.customsYear') || 'Customs clearance year'}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={String(form.date_of_customs_clearance || '')}
                        onChange={(e) => setForm((f) => ({
                            ...f,
                            date_of_customs_clearance: e.target.value ? Number(e.target.value) : ''
                        }))}
                    >
                        <option value="">—</option>
                        {years().map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        className="block text-xs text-muted-foreground mb-1">{t('labels.modelYear') || 'Model year'}</label>
                    <select
                        className="h-9 w-full border border-input bg-background rounded-md px-2 text-sm"
                        value={String(form.model_year || '')}
                        onChange={(e) => setForm((f) => ({
                            ...f,
                            model_year: e.target.value ? Number(e.target.value) : ''
                        }))}
                    >
                        <option value="">—</option>
                        {years().map((y) => (
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
                            className="h-9 w-full border border-input bg-background rounded-md px-3 pr-12 text-sm"
                            value={form.price_per_day}
                            onChange={(e) => setForm((f) => ({...f, price_per_day: e.target.value}))}
                        />
                        <span
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MAD</span>
                    </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                    <input id="available" type="checkbox" className="size-4" checked={!!form.is_available}
                           onChange={(e) => setForm((f) => ({...f, is_available: e.target.checked}))}/>
                    <label htmlFor="available" className="text-sm">{t('table.available')}</label>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50"
                    >
                        {t('buttons.create')}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.replace('/admin/equipments')}
                        className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                        {t('buttons.cancel')}
                    </button>
                </div>
            </form>
        </div>
    )
}
