'use client'

import React from 'react'
import {useTranslations} from 'next-intl'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {usePathname, useRouter} from '@/i18n/navigation'
import {useSearchParams} from 'next/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import {toast} from 'sonner'

// Minimal user shape for rendering
interface UserRow {
    id?: string
    name?: string
    username?: string
    email?: string
    status?: string
    created_at?: string | null

    [k: string]: unknown
}

type Paged<T> = { items: T[]; total: number; pageIndex: number; pageSize: number }

type UsersFilters = {
    query: string
    status?: 'ACTIVE' | 'INACTIVE'
}

async function fetchUsers(input: {
    pageIndex: number
    pageSize: number
    sort: { key: string; order: 'asc' | 'desc' }
    query: string
    status?: 'ACTIVE' | 'INACTIVE'
}): Promise<Paged<UserRow>> {
    const payload: Record<string, unknown> = {
        pageIndex: input.pageIndex,
        pageSize: input.pageSize,
        sort: input.sort,
        query: input.query ?? '',
    }
    const filterData: Record<string, unknown> = {}
    if (input.status) filterData.status = input.status
    if (Object.keys(filterData).length > 0) payload.filterData = filterData

    const res = await fetch('/api/users/list', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
    })
    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await res.json() : await res.text()
    if (!res.ok) {
        const msg = isJson && data && typeof data === 'object' && 'message' in data ? (data as any).message : String(data)
        throw new Error(msg || 'Failed to load users')
    }

    // Normalize various response shapes
    const normalize = (raw: any): Paged<UserRow> => {
        if (raw && Array.isArray(raw.items) && typeof raw.total === 'number') {
            return {
                items: raw.items as UserRow[],
                total: raw.total as number,
                pageIndex: typeof raw.pageIndex === 'number' ? raw.pageIndex : input.pageIndex,
                pageSize: typeof raw.pageSize === 'number' ? raw.pageSize : input.pageSize,
            }
        }
        if (raw && Array.isArray(raw.data) && typeof raw.total === 'number') {
            return {
                items: raw.data as UserRow[],
                total: raw.total as number,
                pageIndex: input.pageIndex,
                pageSize: input.pageSize
            }
        }
        return {items: [], total: 0, pageIndex: input.pageIndex, pageSize: input.pageSize}
    }

    return normalize(data)
}

export default function AdminUsersPage() {
    const t = useTranslations('admin.users')
    const router = useRouter()
    const qc = useQueryClient()

    const [pageIndex, setPageIndex] = React.useState(1)
    const [pageSize] = React.useState(10)
    const [sort, setSort] = React.useState<{ key: string; order: 'asc' | 'desc' }>({key: 'username', order: 'asc'})

    const [filters, setFilters] = React.useState<UsersFilters>({query: ''})
    const [applied, setApplied] = React.useState<UsersFilters>(filters)

    // URL sync for q and page
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

    const {data, isFetching, isError, error} = useQuery({
        queryKey: ['users', 'list', {pageIndex, pageSize, sort, applied}],
        queryFn: () => fetchUsers({pageIndex, pageSize, sort, query: applied.query, status: applied.status}),
        keepPreviousData: true,
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
        setPageIndex(1)
        setApplied({query: ''})
    }

    function toggleSort(key: string) {
        setSort((s) => {
            if (s.key === key) return {key, order: s.order === 'asc' ? 'desc' : 'asc'}
            return {key, order: 'asc'}
        })
    }

    async function changeStatus(id?: string, target?: 'ACTIVE' | 'INACTIVE') {
        if (!id || !target) return
        try {
            const res = await fetch('/api/users/change_status', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id, status: target}),
            })
            const ct = res.headers.get('content-type') || ''
            const isJson = ct.includes('application/json')
            const data = isJson ? await res.json() : await res.text()
            if (!res.ok) throw new Error((isJson && data && typeof data === 'object' && 'message' in data) ? (data as any).message : String(data))
            toast.success(t('toasts.statusChanged'))
            qc.invalidateQueries({queryKey: ['users', 'list']})
        } catch (e: any) {
            toast.error(e?.message || t('errors.changeStatus'))
        }
    }

    // Delete dialog state
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteId, setDeleteId] = React.useState<string | undefined>(undefined)

    async function confirmDelete() {
        if (!deleteId) return
        try {
            const res = await fetch('/api/users/delete', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: deleteId}),
            })
            const ct = res.headers.get('content-type') || ''
            const isJson = ct.includes('application/json')
            const data = isJson ? await res.json() : await res.text()
            if (!res.ok) throw new Error((isJson && data && typeof data === 'object' && 'message' in data) ? (data as any).message : String(data))
            toast.success(t('toasts.userDeleted'))
            // Adjust page if needed
            const remaining = (items.length - 1)
            const nextPage = remaining <= 0 && pageIndex > 1 ? pageIndex - 1 : pageIndex
            setPageIndex(nextPage)
            qc.invalidateQueries({queryKey: ['users', 'list']})
        } catch (e: any) {
            toast.error(e?.message || t('errors.deleteUser'))
        }
    }

    function StatusBadge({status}: { status?: string }) {
        const s = (status || '').toUpperCase()
        const cls = s === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
        const label = s === 'ACTIVE' ? t('status.active') : t('status.inactive')
        return <span className={`inline-flex items-center rounded-full border px-2 h-6 text-xs ${cls}`}>{label}</span>
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.search')}</label>
                    <input
                        value={filters.query}
                        onChange={(e) => setFilters((f) => ({...f, query: e.target.value}))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') applyFilters()
                        }}
                        placeholder={t('labels.searchPlaceholder')}
                        className="h-9 w-[240px] border border-input bg-background rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.status')}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm min-w-[160px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={filters.status ?? ''}
                        onChange={(e) => setFilters((f) => ({...f, status: (e.target.value || undefined) as any}))}
                    >
                        <option value="">{t('labels.all')}</option>
                        <option value="ACTIVE">{t('status.active')}</option>
                        <option value="INACTIVE">{t('status.inactive')}</option>
                    </select>
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

            {/* Table */}
            <div className="rounded-lg border bg-card">
                {isError ? (
                    <div className="p-6 text-sm text-red-700">{t('error')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0 z-10">
                            <tr className="text-start">
                                <th className="px-3 py-2 font-medium cursor-pointer text-start"
                                    onClick={() => toggleSort('name')}>
                                    {t('table.name')}{' '}{sort.key === 'name' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-3 py-2 font-medium cursor-pointer text-start"
                                    onClick={() => toggleSort('username')}>
                                    {t('table.username')}{' '}{sort.key === 'username' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-3 py-2 font-medium cursor-pointer text-start"
                                    onClick={() => toggleSort('email')}>
                                    {t('table.email')}{' '}{sort.key === 'email' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-3 py-2 font-medium text-start">{t('table.status')}</th>
                                <th className="px-3 py-2 font-medium text-right">{t('table.actions')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {isFetching && items.length === 0 ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="px-3 py-2">
                                            <div className="h-4 w-32 bg-muted animate-pulse rounded"/>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="h-4 w-28 bg-muted animate-pulse rounded"/>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="h-4 w-40 bg-muted animate-pulse rounded"/>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="h-6 w-20 bg-muted animate-pulse rounded"/>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <div className="h-6 w-24 bg-muted animate-pulse rounded ms-auto"/>
                                        </td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr className="border-t">
                                    <td className="px-3 py-8 text-center text-muted-foreground"
                                        colSpan={5}>{t('empty')}</td>
                                </tr>
                            ) : (
                                items.map((u, idx) => {
                                    const id = u.id || ''
                                    const name = u.name || '-'
                                    const username = u.username || '-'
                                    const email = u.email || '-'
                                    const status = (u.status || '').toUpperCase()
                                    const nextStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                    return (
                                        <tr key={id || idx} className="border-t">
                                            <td className="px-3 py-2">{name}</td>
                                            <td className="px-3 py-2">{username}</td>
                                            <td className="px-3 py-2">{email}</td>
                                            <td className="px-3 py-2"><StatusBadge status={status}/></td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => changeStatus(id, nextStatus as any)}
                                                        className="h-8 rounded-md border border-input bg-background px-2 text-xs hover:bg-accent"
                                                    >
                                                        {status === 'ACTIVE' ? t('buttons.deactivate') : t('buttons.activate')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteId(id);
                                                            setDeleteOpen(true)
                                                        }}
                                                        className="h-8 rounded-md border border-destructive text-destructive px-2 text-xs hover:bg-destructive/10"
                                                    >
                                                        {t('buttons.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between px-3 py-2 border-t text-sm">
                    <div className="text-muted-foreground">
                        {t('pagination.pageOf', {page: pageIndex, total: totalPages})}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="h-8 rounded-md border border-input bg-background px-2 disabled:opacity-50"
                            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                            disabled={pageIndex <= 1 || isFetching}
                        >
                            {t('pagination.previous')}
                        </button>
                        <button
                            className="h-8 rounded-md border border-input bg-background px-2 disabled:opacity-50"
                            onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                            disabled={pageIndex >= totalPages || isFetching}
                        >
                            {t('pagination.next')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete dialog */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title={t('dialogs.deleteTitle')}
                description={t('dialogs.deleteDescription')}
                confirmLabel={t('buttons.delete')}
                cancelLabel={t('buttons.cancel')}
                onConfirm={confirmDelete}
            />
        </div>
    )
}
