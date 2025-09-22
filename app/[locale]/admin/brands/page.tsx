"use client"

import React from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {CreateName, refsService} from '@/services/refs'
import {toast} from 'sonner'
import {useTranslations} from 'next-intl'

// Minimal item shape
type RefItem = { id?: string; _id?: string; name?: string; created_at?: string | null; [k: string]: unknown }

export default function AdminBrandsPage() {
    const qc = useQueryClient()
    const t = useTranslations('admin.refs.brands')
    const [name, setName] = React.useState('')

    const {data, isLoading, isError, error, refetch, isFetching} = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const res = await refsService.getBrands()
            return Array.isArray(res.data) ? (res.data as RefItem[]) : []
        },
    })

    const mutation = useMutation({
        mutationFn: async (payload: CreateName) => {
            const res = await refsService.createBrand(payload)
            return res.data
        },
        onSuccess: () => {
            toast.success(t('toasts.created'))
            setName('')
            qc.invalidateQueries({queryKey: ['brands']})
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Failed to create brand'
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
                className="flex items-center gap-2"
                onSubmit={(e) => {
                    e.preventDefault()
                    const trimmed = name.trim()
                    if (!trimmed) return
                    mutation.mutate({name: trimmed})
                }}
            >
                <input
                    type="text"
                    className="h-9 border rounded-md px-3 text-sm w-64"
                    placeholder={t('form.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label={t('form.nameLabel')}
                    disabled={mutation.isPending}
                />
                <button
                    type="submit"
                    className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50"
                    disabled={mutation.isPending || name.trim().length === 0}
                >
                    {mutation.isPending ? t('form.adding') : t('form.add')}
                </button>
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
                            data.map((b, idx) => (
                                <tr key={(b.id || b._id || idx.toString()) as string}
                                    className="border-b last:border-0">
                                    <td className="p-3">{b.name ?? '-'}</td>
                                    <td className="p-3">{b.created_at ? new Date(b.created_at).toLocaleString() : '-'}</td>
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
