"use client"

import React from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {CreateCity, refsService} from '@/services/refs'
import {toast} from 'sonner'
import {useLocale, useTranslations} from 'next-intl'

// Minimal item shape
// The backend may localize name; otherwise expose name_en/name_fr/name_ar
// We will attempt to render in current locale with sensible fallbacks.
interface CityItem {
    id?: string
    _id?: string
    name?: string
    name_en?: string
    name_fr?: string
    name_ar?: string
    created_at?: string | null

    [k: string]: unknown
}

function getCityLabel(c: CityItem, locale: string) {
    const l = locale.split('-')[0]
    if (c.name) return c.name
    if (l === 'fr') return c.name_fr ?? c.name_en ?? c.name_ar ?? '-'
    if (l === 'ar') return c.name_ar ?? c.name_fr ?? c.name_en ?? '-'
    // default en
    return c.name_en ?? c.name_fr ?? c.name_ar ?? '-'
}

export default function AdminCitiesPage() {
    const qc = useQueryClient()
    const locale = useLocale()
    const t = useTranslations('admin.refs.cities')

    const [form, setForm] = React.useState<CreateCity>({name_en: '', name_fr: '', name_ar: ''})

    const {data, isLoading, isError, error, refetch, isFetching} = useQuery({
        queryKey: ['cities', locale],
        queryFn: async () => {
            const res = await refsService.getCities()
            return Array.isArray(res.data) ? (res.data as CityItem[]) : []
        },
    })

    const mutation = useMutation({
        mutationFn: async (payload: CreateCity) => {
            const res = await refsService.createCity(payload)
            return res.data
        },
        onSuccess: () => {
            toast.success(t('toasts.created'))
            setForm({name_en: '', name_fr: '', name_ar: ''})
            qc.invalidateQueries({queryKey: ['cities']})
            qc.invalidateQueries({queryKey: ['cities', locale]})
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Failed to create city'
            toast.error(msg)
        },
    })

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
                    const payload: CreateCity = {
                        name_en: form.name_en.trim(),
                        name_fr: form.name_fr.trim(),
                        ...(form.name_ar?.trim() ? {name_ar: form.name_ar.trim()} : {}),
                    }
                    if (!payload.name_en || !payload.name_fr) return
                    mutation.mutate(payload)
                }}
            >
                <div>
                    <label className="block text-xs mb-1">{t('form.nameEnLabel')}</label>
                    <input
                        type="text"
                        className="h-9 w-full border rounded-md px-3 text-sm"
                        placeholder="Casablanca"
                        value={form.name_en}
                        onChange={(e) => setForm((f) => ({...f, name_en: e.target.value}))}
                        disabled={mutation.isPending}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('form.nameFrLabel')}</label>
                    <input
                        type="text"
                        className="h-9 w-full border rounded-md px-3 text-sm"
                        placeholder="Casablanca"
                        value={form.name_fr}
                        onChange={(e) => setForm((f) => ({...f, name_fr: e.target.value}))}
                        disabled={mutation.isPending}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('form.nameArLabel')}</label>
                    <input
                        type="text"
                        className="h-9 w-full border rounded-md px-3 text-sm"
                        placeholder="الدار البيضاء"
                        value={form.name_ar ?? ''}
                        onChange={(e) => setForm((f) => ({...f, name_ar: e.target.value}))}
                        disabled={mutation.isPending}
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50"
                        disabled={mutation.isPending || !form.name_en.trim() || !form.name_fr.trim()}
                    >
                        {mutation.isPending ? t('form.adding') : t('form.add')}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="rounded-md border bg-white">
                <div className="flex items-center justify-between p-3 border-b">
                    <div className="text-sm font-medium">{t('list.title')}</div>
                    <button className="text-sm underline" onClick={() => refetch()}
                            disabled={isFetching}>{t('list.refresh')}</button>
                </div>
                {isLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">{t('list.loading')}</div>
                ) : isError ? (
                    <div className="p-4 text-sm text-red-600">{String((error as any)?.message ?? t('list.error'))}</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-start border-b">
                            <th className="p-3 text-start">{t('list.table.name')}</th>
                            <th className="p-3 text-start">{t('list.table.created')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data && data.length > 0 ? (
                            data.map((c, idx) => (
                                <tr key={(c.id || c._id || idx.toString()) as string}
                                    className="border-b last:border-0">
                                    <td className="p-3">{getCityLabel(c, locale)}</td>
                                    <td className="p-3">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="p-3 text-sm text-muted-foreground" colSpan={2}>{t('list.empty')}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
