"use client"

import React from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {BrandRef, CategoryRef, CreateModel, ModelRef, refsService} from '@/services/refs'
import {toast} from 'sonner'
import {useLocale, useTranslations} from 'next-intl'

// Minimal shapes
interface Item {
    id?: string;
    _id?: string;
    name?: string;

    [k: string]: unknown
}

type ModelRow = ModelRef & { brand_id?: string; category_id?: string }

export default function AdminModelsPage() {
    const qc = useQueryClient()
    const locale = useLocale()
    const t = useTranslations('admin.refs.models')

    const [form, setForm] = React.useState<CreateModel>({name: '', brand_id: '', category_id: ''})

    const brandsQ = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const res = await refsService.getBrands()
            return (Array.isArray(res.data) ? res.data : []) as BrandRef[]
        },
    })

    const categoriesQ = useQuery({
        queryKey: ['categories', locale],
        queryFn: async () => {
            const res = await refsService.getCategories()
            return (Array.isArray(res.data) ? res.data : []) as CategoryRef[]
        },
    })

    const modelsQ = useQuery({
        queryKey: ['models'],
        queryFn: async () => {
            const res = await refsService.getModels()
            return (Array.isArray(res.data) ? res.data : []) as ModelRow[]
        },
    })

    const mutation = useMutation({
        mutationFn: async (payload: CreateModel) => {
            const res = await refsService.createModel(payload)
            return res.data
        },
        onSuccess: () => {
            toast.success(t('toasts.created'))
            setForm({name: '', brand_id: '', category_id: ''})
            qc.invalidateQueries({queryKey: ['models']})
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Failed to create model'
            toast.error(msg)
        },
    })

    const canSubmit = form.name.trim() && form.brand_id && form.category_id

    function nameOf(list: { id?: string; _id?: string; name?: string }[], id?: string) {
        const found = list?.find((x) => (x.id || x._id) === id)
        return found?.name ?? id ?? '-'
    }

    function brandName(m: ModelRow): string {
        const b = (m as any).brand
        if (b && typeof b === 'object') return (b as BrandRef).name ?? '-'
        if (typeof b === 'string') {
            const found = (brandsQ.data || []).find((x) => (x.id || x._id) === b)
            return found?.name ?? b
        }
        const id = (m as any).brand_id as string | undefined
        return nameOf((brandsQ.data || []) as any, id)
    }

    function categoryName(m: ModelRow): string {
        const c = (m as any).category
        if (c && typeof c === 'object') {
            const cat = c as CategoryRef
            // Prefer explicit localized fields, then generic name
            const loc = String(locale || 'en').toLowerCase()
            if (loc.startsWith('fr')) return cat.name_fr ?? cat.name ?? cat.name_en ?? cat.name_ar ?? '-'
            if (loc.startsWith('ar')) return cat.name_ar ?? cat.name ?? cat.name_en ?? cat.name_fr ?? '-'
            return cat.name_en ?? cat.name ?? cat.name_fr ?? cat.name_ar ?? '-'
        }
        if (typeof c === 'string') {
            const found = (categoriesQ.data || []).find((x) => (x.id || x._id) === c)
            if (found) return found.name ?? c
            return c
        }
        const id = (m as any).category_id as string | undefined
        return nameOf((categoriesQ.data || []) as any, id)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>

            {/* Create form */}
            <form
                className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end"
                onSubmit={(e) => {
                    e.preventDefault()
                    if (!canSubmit) return
                    mutation.mutate({
                        name: form.name.trim(),
                        brand_id: form.brand_id,
                        category_id: form.category_id,
                    })
                }}
            >
                <div>
                    <label className="block text-xs mb-1">{t('form.nameLabel')}</label>
                    <input
                        type="text"
                        className="h-10 w-full border rounded-md px-3 text-sm"
                        placeholder="D6T"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
                        disabled={mutation.isPending}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('form.brandLabel')}</label>
                    <select
                        className="h-10 w-full border rounded-md px-2 text-sm bg-background"
                        value={form.brand_id}
                        onChange={(e) => setForm((f) => ({...f, brand_id: e.target.value}))}
                        disabled={mutation.isPending || brandsQ.isLoading}
                    >
                        <option value="">{t('form.selectBrand')}</option>
                        {brandsQ.data?.map((b) => (
                            <option key={(b.id || b._id) as string}
                                    value={(b.id || b._id) as string}>{b.name ?? '-'}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('form.categoryLabel')}</label>
                    <select
                        className="h-10 w-full border rounded-md px-2 text-sm bg-background"
                        value={form.category_id}
                        onChange={(e) => setForm((f) => ({...f, category_id: e.target.value}))}
                        disabled={mutation.isPending || categoriesQ.isLoading}
                    >
                        <option value="">{t('form.selectCategory')}</option>
                        {categoriesQ.data?.map((c) => (
                            <option key={(c.id || c._id) as string}
                                    value={(c.id || c._id) as string}>{c.name ?? '-'}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <button
                        type="submit"
                        className="inline-flex items-center h-10 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50"
                        disabled={mutation.isPending || !canSubmit}
                    >
                        {mutation.isPending ? t('form.adding') : t('form.add')}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="rounded-md border bg-white">
                <div className="flex items-center justify-between p-3 border-b">
                    <div className="text-sm font-medium">{t('list.title')}</div>
                    <button className="text-sm underline" onClick={() => modelsQ.refetch()}
                            disabled={modelsQ.isFetching}>{t('list.refresh')}</button>
                </div>
                {modelsQ.isLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">{t('list.loading')}</div>
                ) : modelsQ.isError ? (
                    <div
                        className="p-4 text-sm text-red-600">{String((modelsQ.error as any)?.message ?? t('list.error'))}</div>
                ) : (
                    <>
                        {/* Desktop Table - hidden on mobile */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                <tr className="border-b">
                                    <th className="p-3 text-start sticky top-0 bg-white">{t('list.table.name')}</th>
                                    <th className="p-3 text-start sticky top-0 bg-white">{t('list.table.brand')}</th>
                                    <th className="p-3 text-start sticky top-0 bg-white">{t('list.table.category')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {modelsQ.data && modelsQ.data.length > 0 ? (
                                    modelsQ.data.map((m, idx) => (
                                        <tr key={(m.id || m._id || idx.toString()) as string}
                                            className="border-b last:border-0">
                                            <td className="p-3 truncate" title={m.name ?? '-'}>{m.name ?? '-'}</td>
                                            <td className="p-3 whitespace-nowrap">{brandName(m)}</td>
                                            <td className="p-3 whitespace-nowrap">{categoryName(m)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="p-3 text-sm text-muted-foreground"
                                            colSpan={3}>{t('list.empty')}</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards - hidden on desktop */}
                        <div className="sm:hidden space-y-2">
                            {modelsQ.data && modelsQ.data.length > 0 ? (
                                modelsQ.data.map((m, idx) => (
                                    <div key={(m.id || m._id || idx.toString()) as string}
                                         className="border rounded-lg p-3 bg-white">
                                        <div className="font-medium text-sm mb-2">{m.name ?? '-'}</div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">
                                                Brand: {brandName(m)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Category: {categoryName(m)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-sm text-muted-foreground text-center">{t('list.empty')}</div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
