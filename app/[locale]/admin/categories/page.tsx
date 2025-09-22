"use client"

import React from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {CategoryRef, CreateCategory, refsService} from '@/services/refs'
import {useLocale, useTranslations} from 'next-intl'
import {toast} from 'sonner'

function getCategoryLabel(c: CategoryRef, locale: string) {
    const l = locale.split('-')[0]
    if (l === 'fr') return c.name_fr ?? c.name ?? c.name_en ?? c.name_ar ?? '-'
    if (l === 'ar') return c.name_ar ?? c.name ?? c.name_en ?? c.name_fr ?? '-'
    return c.name_en ?? c.name ?? c.name_fr ?? c.name_ar ?? '-'
}

export default function AdminCategoriesPage() {
    const t = useTranslations('admin.refs.categories')
    const tFoa = useTranslations('admin.equipments.foa')
    const locale = useLocale()
    const qc = useQueryClient()

    const [form, setForm] = React.useState<CreateCategory>({
        name_en: '',
        name_fr: '',
        name_ar: '',
        field_of_activity: ''
    })

    const {data, isLoading, isError, error, refetch, isFetching} = useQuery({
        queryKey: ['categories', locale],
        queryFn: async () => {
            const res = await refsService.getCategories()
            return Array.isArray(res.data) ? res.data as CategoryRef[] : []
        },
    })

    const foaQ = useQuery({
        queryKey: ['foa'],
        queryFn: async () => {
            const res = await refsService.getFoa()
            return Array.isArray(res.data) ? res.data as string[] : []
        },
        staleTime: 60_000,
    })

    const mutation = useMutation({
        mutationFn: async (payload: CreateCategory) => {
            const res = await refsService.createCategory(payload)
            return res.data
        },
        onSuccess: () => {
            toast.success(t('toasts.created'))
            setForm({name_en: '', name_fr: '', name_ar: '', field_of_activity: ''})
            qc.invalidateQueries({queryKey: ['categories']})
            qc.invalidateQueries({queryKey: ['categories', locale]})
            qc.invalidateQueries({queryKey: ['refs', 'categories', locale]})
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Failed to create category'
            toast.error(msg)
        },
    })

    const canSubmit = form.name_en.trim() && form.name_fr.trim() && form.name_ar.trim() && form.field_of_activity

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>

            <form
                className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end"
                onSubmit={(e) => {
                    e.preventDefault()
                    if (!canSubmit) return
                    mutation.mutate({
                        name_en: form.name_en.trim(),
                        name_fr: form.name_fr.trim(),
                        name_ar: form.name_ar.trim(),
                        field_of_activity: form.field_of_activity,
                    })
                }}
            >
                <div>
                    <label className="block text-xs mb-1">{t('form.nameEnLabel')}</label>
                    <input
                        type="text"
                        className="h-9 w-full border rounded-md px-3 text-sm"
                        placeholder="Backhoe Loader"
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
                        placeholder="Tractopelle"
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
                        placeholder="حفار لودر"
                        value={form.name_ar}
                        onChange={(e) => setForm((f) => ({...f, name_ar: e.target.value}))}
                        disabled={mutation.isPending}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('form.foaLabel')}</label>
                    <select
                        className="h-9 w-full border rounded-md px-2 text-sm bg-background"
                        value={form.field_of_activity}
                        onChange={(e) => setForm((f) => ({...f, field_of_activity: e.target.value}))}
                        disabled={mutation.isPending || foaQ.isLoading}
                    >
                        <option value="">--</option>
                        {foaQ.data?.map((foa) => (
                            <option key={foa} value={foa}>{tFoa(foa)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <button
                        type="submit"
                        className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50"
                        disabled={mutation.isPending || !canSubmit}
                    >
                        {mutation.isPending ? t('form.adding') : t('form.add')}
                    </button>
                </div>
            </form>

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
                            <th className="p-3 text-start">{t('list.table.foa')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data && data.length > 0 ? (
                            data.map((c, idx) => (
                                <tr key={(c.id || (c as any)._id || idx.toString()) as string}
                                    className="border-b last:border-0">
                                    <td className="p-3">{getCategoryLabel(c, locale)}</td>
                                    <td className="p-3">{c.field_of_activity ? tFoa(String(c.field_of_activity)) : '-'}</td>
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
