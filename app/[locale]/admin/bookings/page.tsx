'use client'

import React from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {bookingsService, type CreateBookingForm, type UpdateBookingForm} from '@/services/bookings'
import Portal from '@/components/ui/Portal'
import {useTranslations} from 'next-intl'

// Minimal booking row shape for rendering
interface BookingRow {
    id?: string
    client_label?: string
    equipment_label?: string
    pilot_label?: string
    start_date?: string
    end_date?: string
    status?: string
    _raw?: any
}

function getId(val: any): string | undefined {
    if (!val || typeof val !== 'object') return undefined
    if (typeof val.id === 'string') return val.id
    if (typeof val._id === 'string') return val._id
    return undefined
}

function getName(val: any): string | undefined {
    if (!val) return undefined
    if (typeof val === 'string') return val
    if (typeof val === 'object') {
        return (
            (val.name as string) ||
            (val.username as string) ||
            (val.email as string) ||
            (val.title as string) ||
            (val.label as string) ||
            undefined
        )
    }
    return undefined
}

function toRow(raw: any): BookingRow {
    const clientLabel = getName(raw.client) || raw.client_name || raw.client || '-'
    const equipmentLabel = getName(raw.equipment) || raw.equipment_title || raw.equipment_name || raw.equipment || '-'
    const pilotLabel = getName(raw.pilot) || raw.pilot_name || raw.pilot || '-'
    const id = typeof raw.id === 'string' ? raw.id : (typeof raw._id === 'string' ? raw._id : undefined)
    return {
        id,
        client_label: typeof clientLabel === 'string' ? clientLabel : '-',
        equipment_label: typeof equipmentLabel === 'string' ? equipmentLabel : '-',
        pilot_label: typeof pilotLabel === 'string' ? pilotLabel : '-',
        start_date: typeof raw.start_date === 'string' ? raw.start_date : (typeof raw.start === 'string' ? raw.start : undefined),
        end_date: typeof raw.end_date === 'string' ? raw.end_date : (typeof raw.end === 'string' ? raw.end : undefined),
        status: typeof raw.status === 'string' ? raw.status : undefined,
        _raw: raw,
    }
}

function withinRange(date: string | undefined, from?: string, to?: string): boolean {
    if (!date) return false
    const d = date
    if (from && d < from) return false
    if (to && d > to) return false
    return true
}

function getFriendlyBookingError(err: unknown): string {
    const raw = (() => {
        if (!err) return ''
        if (typeof err === 'string') return err
        if (typeof (err as any)?.message === 'string') return (err as any).message as string
        try {
            return JSON.stringify(err)
        } catch {
            return ''
        }
    })().toLowerCase()
    if (raw.includes('overlap') || raw.includes('conflict') || raw.includes('already booked')) {
        return 'These dates overlap an existing booking for this equipment. Please choose a different date range.'
    }
    if (raw.includes('pilot') && raw.includes('unavailable')) {
        return 'Selected pilot is unavailable for the chosen dates.'
    }
    if (raw.includes('unauthorized') || raw.includes('forbidden') || raw.includes('401') || raw.includes('403')) {
        return 'You are not authorized to perform this action.'
    }
    return (typeof (err as any)?.message === 'string' && (err as any).message) || 'Unexpected error'
}

export default function AdminBookingsPage() {
    const qc = useQueryClient()
    const t = useTranslations('admin.bookings')

    const [statusFilter, setStatusFilter] = React.useState<string>('')
    const [equipmentIdFilter, setEquipmentIdFilter] = React.useState<string>('')
    const [fromDate, setFromDate] = React.useState<string>('')
    const [toDate, setToDate] = React.useState<string>('')

    const {data, isFetching, isError, error, refetch} = useQuery({
        queryKey: ['bookings', 'list'],
        queryFn: async () => {
            const res = await bookingsService.list()
            const arr = Array.isArray(res.data) ? res.data : []
            return arr as any[]
        },
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    })

    const {data: usersData, isLoading: usersLoading} = useQuery({
        queryKey: ['users', 'options'],
        queryFn: async () => {
            const res = await fetch('/api/users/list', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({pageIndex: 1, pageSize: 100, sort: {key: 'username', order: 'asc'}, query: ''})
            })
            const contentType = res.headers.get('content-type') || ''
            const isJson = contentType.includes('application/json')
            const data = isJson ? await res.json() : await res.text()
            if (!res.ok) {
                const msg = isJson && data && typeof data === 'object' && 'message' in data ? (data as any).message : String(data)
                throw new Error(msg || 'Failed to load users')
            }
            if (data && Array.isArray((data as any).items)) return (data as any).items as any[]
            if (data && Array.isArray((data as any).data)) return (data as any).data as any[]
            return Array.isArray(data) ? (data as any[]) : []
        },
        staleTime: 60_000,
        placeholderData: (prev) => prev as any,
    })

    const {data: equipmentsData, isLoading: equipmentsLoading} = useQuery({
        queryKey: ['equipments', 'options'],
        queryFn: async () => {
            const res = await fetch('/api/equipments/filter', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({pageIndex: 1, pageSize: 100})
            })
            const contentType = res.headers.get('content-type') || ''
            const isJson = contentType.includes('application/json')
            const data = isJson ? await res.json() : await res.text()
            if (!res.ok) {
                const msg = isJson && data && typeof data === 'object' && 'message' in data ? (data as any).message : String(data)
                throw new Error(msg || 'Failed to load equipments')
            }
            if (data && typeof data === 'object' && Array.isArray((data as any).items)) return (data as any).items as any[]
            if (data && Array.isArray((data as any).data)) return (data as any).data as any[]
            return [] as any[]
        },
        staleTime: 60_000,
        placeholderData: (prev) => prev as any,
    })

    const {data: pilotsData, isLoading: pilotsLoading} = useQuery({
        queryKey: ['pilotes', 'options'],
        queryFn: async () => {
            const res = await fetch('/api/pilotes', {method: 'GET'})
            const contentType = res.headers.get('content-type') || ''
            const isJson = contentType.includes('application/json')
            const data = isJson ? await res.json() : await res.text()
            if (!res.ok) {
                const msg = isJson && data && typeof data === 'object' && 'message' in data ? (data as any).message : String(data)
                throw new Error(msg || 'Failed to load pilots')
            }
            if (Array.isArray(data)) return data as any[]
            if (data && typeof data === 'object' && Array.isArray((data as any).items)) return (data as any).items as any[]
            if (data && Array.isArray((data as any).data)) return (data as any).data as any[]
            return [] as any[]
        },
        staleTime: 60_000,
        placeholderData: (prev) => prev as any,
    })

    const userOptions = React.useMemo(() => {
        const arr = Array.isArray(usersData) ? usersData : []
        return arr.map((u: any) => ({
            id: getId(u) || '',
            label: getName(u) || (u.username || u.email || u.name || 'Unnamed')
        }))
            .filter((o: any) => o.id)
    }, [usersData])

    const equipmentOptions = React.useMemo(() => {
        const arr = Array.isArray(equipmentsData) ? equipmentsData : []
        return arr.map((e: any) => ({id: getId(e) || '', label: getName(e) || (e.title || e.name || 'Untitled')}))
            .filter((o: any) => o.id)
    }, [equipmentsData])

    const pilotOptions = React.useMemo(() => {
        const arr = Array.isArray(pilotsData) ? pilotsData : []
        return arr.map((p: any) => ({
            id: getId(p) || '',
            label: getName(p) || (p.username || p.email || p.name || 'Unnamed')
        }))
            .filter((o: any) => o.id)
    }, [pilotsData])

    const rawItems = Array.isArray(data) ? data : []
    const rows: BookingRow[] = rawItems.map(toRow)
    const filteredRows = rows.filter((r) => {
        if (statusFilter && (r.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false
        if (equipmentIdFilter) {
            const raw = r._raw || {}
            const eqId = typeof raw.equipment_id === 'string' ? raw.equipment_id : getId(raw.equipment)
            if (String(eqId || '').toLowerCase() !== equipmentIdFilter.trim().toLowerCase()) return false
        }
        if (fromDate && !withinRange(r.start_date, fromDate, undefined)) return false
        if (toDate && !withinRange(r.end_date, undefined, toDate)) return false
        return true
    })

    // Create dialog state
    const [createOpen, setCreateOpen] = React.useState(false)
    const [createSaving, setCreateSaving] = React.useState(false)
    const [createForm, setCreateForm] = React.useState<CreateBookingForm>({
        client_id: '', equipment_id: '', start_date: '', end_date: '', pilot_id: '',
    })
    const [createErrors, setCreateErrors] = React.useState<Record<string, string>>({})

    function validateCreate(): boolean {
        const e: Record<string, string> = {}
        const req = t('validation.required')
        if (!createForm.client_id) e.client_id = req
        if (!createForm.equipment_id) e.equipment_id = req
        if (!createForm.pilot_id) e.pilot_id = req
        if (!createForm.start_date) e.start_date = req
        if (!createForm.end_date) e.end_date = req
        if (createForm.start_date && createForm.end_date && createForm.start_date > createForm.end_date) {
            e.end_date = t('validation.endAfterStart')
        }
        setCreateErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validateCreate()) return
        setCreateSaving(true)
        try {
            await bookingsService.create(createForm)
            toast.success(t('toasts.created'))
            try {
                await qc.invalidateQueries({queryKey: ['bookings', 'list']})
            } catch {
            }
            setCreateOpen(false)
            setCreateForm({client_id: '', equipment_id: '', start_date: '', end_date: '', pilot_id: ''})
        } catch (err: any) {
            const msg = getFriendlyBookingError(err) || t('errorCreate')
            toast.error(msg)
            setCreateErrors((prev) => ({...prev, end_date: msg}))
        } finally {
            setCreateSaving(false)
        }
    }

    // Edit dialog state
    const [editOpen, setEditOpen] = React.useState(false)
    const [editSaving, setEditSaving] = React.useState(false)
    const [editId, setEditId] = React.useState<string | undefined>(undefined)
    const [editForm, setEditForm] = React.useState<UpdateBookingForm>({
        id: '',
        client_id: undefined,
        equipment_id: undefined,
        pilot_id: undefined,
        start_date: undefined,
        end_date: undefined,
        status: undefined
    })
    const [editErrors, setEditErrors] = React.useState<Record<string, string>>({})

    function validateEdit(): boolean {
        const e: Record<string, string> = {}
        if (!editId) e.id = 'Missing id'
        if (editForm.start_date && editForm.end_date && editForm.start_date > editForm.end_date) {
            e.end_date = t('validation.endAfterStart')
        }
        setEditErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleEditSubmit(ev: React.FormEvent) {
        ev.preventDefault()
        if (!validateEdit() || !editId) return
        setEditSaving(true)
        try {
            const payload: UpdateBookingForm = {id: editId}
            if (editForm.client_id) payload.client_id = editForm.client_id
            if (editForm.equipment_id) payload.equipment_id = editForm.equipment_id
            if (editForm.pilot_id) payload.pilot_id = editForm.pilot_id
            if (editForm.start_date) payload.start_date = editForm.start_date
            if (editForm.end_date) payload.end_date = editForm.end_date
            if (editForm.status) payload.status = editForm.status
            await bookingsService.update(payload)
            toast.success(t('toasts.updated'))
            try {
                await qc.invalidateQueries({queryKey: ['bookings', 'list']})
            } catch {
            }
            setEditOpen(false)
        } catch (err: any) {
            const msg = getFriendlyBookingError(err) || t('errorUpdate')
            toast.error(msg)
            setEditErrors((prev) => ({...prev, end_date: msg}))
        } finally {
            setEditSaving(false)
        }
    }

    const [detailOpen, setDetailOpen] = React.useState(false)
    const [detailRow, setDetailRow] = React.useState<BookingRow | null>(null)
    const [detailSaving, setDetailSaving] = React.useState(false)

    function openDetail(row: BookingRow) {
        setDetailRow(row)
        setDetailOpen(true)
    }

    async function changeStatus(newStatus: string) {
        if (!detailRow?.id) return
        setDetailSaving(true)
        try {
            await bookingsService.update({id: detailRow.id, status: newStatus})
            toast.success(t('toasts.statusUpdated'))
            try {
                await qc.invalidateQueries({queryKey: ['bookings', 'list']})
            } catch {
            }
            setDetailRow((r) => (r ? {...r, status: newStatus} : r))
        } catch (err: any) {
            toast.error(getFriendlyBookingError(err) || t('errorUpdateStatus'))
        } finally {
            setDetailSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>

            {/* Toolbar */}
            <div className="rounded-lg border bg-card p-4 flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.status')}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm min-w-[160px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">{t('labels.all')}</option>
                        <option value="PENDING">{t('status.PENDING')}</option>
                        <option value="CONFIRMED">{t('status.CONFIRMED')}</option>
                        <option value="CANCELED">{t('status.CANCELED')}</option>
                        <option value="COMPLETED">{t('status.COMPLETED')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.equipment')}</label>
                    <select
                        className="h-9 border border-input bg-background rounded-md px-2 text-sm min-w-[220px]"
                        value={equipmentIdFilter}
                        onChange={(e) => setEquipmentIdFilter(e.target.value)}
                    >
                        <option value="">{t('labels.all')}</option>
                        {equipmentsLoading ? (
                            <option value="" disabled>{t('loading')}</option>
                        ) : (
                            equipmentOptions.map((o: any) => (
                                <option key={o.id} value={o.id}>{o.label}</option>
                            ))
                        )}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.startFrom')}</label>
                    <input type="date" className="h-9 border border-input bg-background rounded-md px-2 text-sm"
                           value={fromDate} onChange={(e) => setFromDate(e.target.value)}/>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">{t('labels.endUntil')}</label>
                    <input type="date" className="h-9 border border-input bg-background rounded-md px-2 text-sm"
                           value={toDate} onChange={(e) => setToDate(e.target.value)}/>
                </div>
                <div className="ms-auto flex items-center gap-2">
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                        {t('buttons.new')}
                    </button>
                    <button
                        onClick={() => {
                            setStatusFilter('');
                            setEquipmentIdFilter('');
                            setFromDate('');
                            setToDate('')
                        }}
                        className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                        {t('buttons.reset')}
                    </button>
                </div>
            </div>

            {/* Table */}
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
                ) : filteredRows.length === 0 && !isFetching ? (
                    <div className="p-8 text-center text-muted-foreground">{t('empty')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="text-start font-medium px-3 py-2 border-b">{t('table.client')}</th>
                                <th className="text-start font-medium px-3 py-2 border-b">{t('table.equipment')}</th>
                                <th className="text-start font-medium px-3 py-2 border-b">{t('table.pilot')}</th>
                                <th className="text-start font-medium px-3 py-2 border-b">{t('table.start')}</th>
                                <th className="text-start font-medium px-3 py-2 border-b">{t('table.end')}</th>
                                <th className="text-start font-medium px-3 py-2 border-b">{t('table.status')}</th>
                                <th className="text-start font-medium px-3 py-2 border-b">{t('table.actions')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {isFetching && rows.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-32"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-40"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-28"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-24"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-24"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-20"/>
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="h-4 bg-muted rounded w-16"/>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredRows.map((r, idx) => (
                                    <tr key={r.id ?? idx} className="hover:bg-slate-50">
                                        <td className="px-3 py-2 border-b">{r.client_label ?? '-'}</td>
                                        <td className="px-3 py-2 border-b">{r.equipment_label ?? '-'}</td>
                                        <td className="px-3 py-2 border-b">{r.pilot_label ?? '-'}</td>
                                        <td className="px-3 py-2 border-b">{r.start_date ?? '-'}</td>
                                        <td className="px-3 py-2 border-b">{r.end_date ?? '-'}</td>
                                        <td className="px-3 py-2 border-b">
                                            {r.status ? (
                                                <span className={
                                                    `inline-flex items-center px-2 py-0.5 rounded-full text-xs ${r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : r.status === 'CANCELED' ? 'bg-red-100 text-red-700' : r.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`
                                                }>{t(`status.${r.status}`)}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="text-slate-600 hover:underline text-xs"
                                                    onClick={() => openDetail(r)}
                                                >
                                                    {t('buttons.view')}
                                                </button>
                                                <button
                                                    className="text-slate-600 hover:underline text-xs"
                                                    onClick={() => {
                                                        const raw = r._raw || {}
                                                        const id = typeof raw.id === 'string' ? raw.id : (typeof raw._id === 'string' ? raw._id : undefined)
                                                        if (!id) return
                                                        setEditId(id)
                                                        setEditForm({
                                                            id,
                                                            client_id: (typeof raw.client_id === 'string' ? raw.client_id : (getId(raw.client))),
                                                            equipment_id: (typeof raw.equipment_id === 'string' ? raw.equipment_id : (getId(raw.equipment))),
                                                            pilot_id: (typeof raw.pilot_id === 'string' ? raw.pilot_id : (getId(raw.pilot))),
                                                            start_date: (typeof raw.start_date === 'string' ? raw.start_date : undefined),
                                                            end_date: (typeof raw.end_date === 'string' ? raw.end_date : undefined),
                                                            status: (typeof raw.status === 'string' ? raw.status : undefined)
                                                        })
                                                        setEditErrors({})
                                                        setEditOpen(true)
                                                    }}
                                                >
                                                    {t('buttons.edit')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create dialog */}
            {createOpen ? (
                <Portal>
                    <div role="dialog" aria-modal="true"
                         className="fixed inset-0 z-[100] flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onMouseDown={() => setCreateOpen(false)}/>
                        <div className="relative z-10 w-full max-w-xl rounded-lg border bg-background p-4 shadow-xl">
                            <div className="mb-2 text-base font-semibold">{t('newTitle')}</div>
                            <p className="text-sm text-muted-foreground mb-4">{t('newSubtitle')}</p>
                            <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.client')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={createForm.client_id}
                                        onChange={(e) => setCreateForm((f) => ({...f, client_id: e.target.value}))}
                                    >
                                        <option value="">{t('placeholders.selectClient')}</option>
                                        {usersLoading ? (
                                            <option value="" disabled>{t('loading')}</option>
                                        ) : (
                                            userOptions.map((o: any) => (
                                                <option key={o.id} value={o.id}>{o.label}</option>
                                            ))
                                        )}
                                    </select>
                                    {createErrors.client_id ?
                                        <p className="text-xs text-red-600 mt-1">{createErrors.client_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.equipment')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={createForm.equipment_id}
                                        onChange={(e) => setCreateForm((f) => ({...f, equipment_id: e.target.value}))}
                                    >
                                        <option value="">{t('placeholders.selectEquipment')}</option>
                                        {equipmentsLoading ? (
                                            <option value="" disabled>{t('loading')}</option>
                                        ) : (
                                            equipmentOptions.map((o: any) => (
                                                <option key={o.id} value={o.id}>{o.label}</option>
                                            ))
                                        )}
                                    </select>
                                    {createErrors.equipment_id ?
                                        <p className="text-xs text-red-600 mt-1">{createErrors.equipment_id}</p> : null}
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.pilot')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={createForm.pilot_id}
                                        onChange={(e) => setCreateForm((f) => ({...f, pilot_id: e.target.value}))}
                                    >
                                        <option value="">{t('placeholders.selectPilot')}</option>
                                        {pilotsLoading ? (
                                            <option value="" disabled>{t('loading')}</option>
                                        ) : (
                                            pilotOptions.map((o: any) => (
                                                <option key={o.id} value={o.id}>{o.label}</option>
                                            ))
                                        )}
                                    </select>
                                    {createErrors.pilot_id ?
                                        <p className="text-xs text-red-600 mt-1">{createErrors.pilot_id}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.startDate')}</label>
                                    <input type="date"
                                           className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                           value={createForm.start_date}
                                           onChange={(e) => setCreateForm((f) => ({
                                               ...f,
                                               start_date: e.target.value
                                           }))}/>
                                    {createErrors.start_date ?
                                        <p className="text-xs text-red-600 mt-1">{createErrors.start_date}</p> : null}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.endDate')}</label>
                                    <input type="date"
                                           className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                           value={createForm.end_date}
                                           onChange={(e) => setCreateForm((f) => ({...f, end_date: e.target.value}))}/>
                                    {createErrors.end_date ?
                                        <p className="text-xs text-red-600 mt-1">{createErrors.end_date}</p> : null}
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2 justify-end">
                                    <button type="button" onClick={() => setCreateOpen(false)}
                                            className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                                        {t('buttons.cancel')}
                                    </button>
                                    <button type="submit" disabled={createSaving}
                                            className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50">
                                        {createSaving ? t('buttons.saving') : t('buttons.create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            ) : null}

            {/* Edit dialog */}
            {editOpen ? (
                <Portal>
                    <div role="dialog" aria-modal="true"
                         className="fixed inset-0 z-[100] flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onMouseDown={() => setEditOpen(false)}/>
                        <div className="relative z-10 w-full max-w-xl rounded-lg border bg-background p-4 shadow-xl">
                            <div className="mb-2 text-base font-semibold">{t('editTitle')}</div>
                            <p className="text-sm text-muted-foreground mb-4">{t('editSubtitle')}</p>
                            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.client')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.client_id ?? ''}
                                        onChange={(e) => setEditForm((f) => ({
                                            ...f,
                                            client_id: e.target.value || undefined
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {usersLoading ? (
                                            <option value="" disabled>Loading…</option>
                                        ) : (
                                            userOptions.map((o: any) => (
                                                <option key={o.id} value={o.id}>{o.label}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.equipment')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.equipment_id ?? ''}
                                        onChange={(e) => setEditForm((f) => ({
                                            ...f,
                                            equipment_id: e.target.value || undefined
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {equipmentsLoading ? (
                                            <option value="" disabled>Loading…</option>
                                        ) : (
                                            equipmentOptions.map((o: any) => (
                                                <option key={o.id} value={o.id}>{o.label}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.pilot')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.pilot_id ?? ''}
                                        onChange={(e) => setEditForm((f) => ({
                                            ...f,
                                            pilot_id: e.target.value || undefined
                                        }))}
                                    >
                                        <option value="">—</option>
                                        {pilotsLoading ? (
                                            <option value="" disabled>Loading…</option>
                                        ) : (
                                            pilotOptions.map((o: any) => (
                                                <option key={o.id} value={o.id}>{o.label}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.startDate')}</label>
                                    <input type="date"
                                           className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                           value={editForm.start_date ?? ''}
                                           onChange={(e) => setEditForm((f) => ({
                                               ...f,
                                               start_date: e.target.value || undefined
                                           }))}/>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('labels.endDate')}</label>
                                    <input type="date"
                                           className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                           value={editForm.end_date ?? ''}
                                           onChange={(e) => setEditForm((f) => ({
                                               ...f,
                                               end_date: e.target.value || undefined
                                           }))}/>
                                    {editErrors.end_date ?
                                        <p className="text-xs text-red-600 mt-1">{editErrors.end_date}</p> : null}
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        className="block text-xs text-muted-foreground mb-1">{t('table.status')}</label>
                                    <select
                                        className="h-9 border border-input bg-background rounded-md px-2 text-sm w-full"
                                        value={editForm.status ?? ''}
                                        onChange={(e) => setEditForm((f) => ({
                                            ...f,
                                            status: e.target.value || undefined
                                        }))}
                                    >
                                        <option value="">—</option>
                                        <option value="PENDING">{t('status.PENDING')}</option>
                                        <option value="CONFIRMED">{t('status.CONFIRMED')}</option>
                                        <option value="CANCELED">{t('status.CANCELED')}</option>
                                        <option value="COMPLETED">{t('status.COMPLETED')}</option>
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2 justify-end">
                                    <button type="button" onClick={() => setEditOpen(false)}
                                            className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                                        {t('buttons.cancel')}
                                    </button>
                                    <button type="submit" disabled={editSaving}
                                            className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50">
                                        {editSaving ? t('buttons.saving') : t('buttons.update')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            ) : null}

            {detailOpen ? (
                <Portal>
                    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100]">
                        <div className="absolute inset-0 bg-black/40" onMouseDown={() => setDetailOpen(false)}/>
                        <div
                            className="absolute right-0 top-0 h-full w-full max-w-lg bg-background border-l shadow-xl p-4 overflow-auto">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-base font-semibold">{t('detailsTitle')}</div>
                                <button onClick={() => setDetailOpen(false)}
                                        className="text-sm text-muted-foreground hover:underline">{t('buttons.close')}</button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div><span className="text-muted-foreground">{t('table.client')}:</span> <span
                                    className="ms-1">{detailRow?.client_label ?? '-'}</span></div>
                                <div><span className="text-muted-foreground">{t('table.equipment')}:</span> <span
                                    className="ms-1">{detailRow?.equipment_label ?? '-'}</span></div>
                                <div><span className="text-muted-foreground">{t('table.pilot')}:</span> <span
                                    className="ms-1">{detailRow?.pilot_label ?? '-'}</span></div>
                                <div><span className="text-muted-foreground">{t('table.start')}:</span> <span
                                    className="ms-1">{detailRow?.start_date ?? '-'}</span></div>
                                <div><span className="text-muted-foreground">{t('table.end')}:</span> <span
                                    className="ms-1">{detailRow?.end_date ?? '-'}</span></div>
                                <div><span className="text-muted-foreground">{t('table.status')}:</span> <span
                                    className="ms-1">{detailRow?.status ? t(`status.${detailRow.status}`) : '-'}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {detailRow?.status !== 'CONFIRMED' && detailRow?.status !== 'COMPLETED' && detailRow?.status !== 'CANCELED' ? (
                                    <button disabled={detailSaving} onClick={() => changeStatus('CONFIRMED')}
                                            className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 disabled:opacity-50">{detailSaving ? t('buttons.saving') : t('buttons.confirm')}</button>
                                ) : null}
                                {detailRow?.status !== 'CANCELED' && detailRow?.status !== 'COMPLETED' ? (
                                    <button disabled={detailSaving} onClick={() => changeStatus('CANCELED')}
                                            className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50">{t('buttons.cancel')}</button>
                                ) : null}
                                {detailRow?.status === 'CONFIRMED' ? (
                                    <button disabled={detailSaving} onClick={() => changeStatus('COMPLETED')}
                                            className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50">{t('buttons.complete')}</button>
                                ) : null}
                                {detailRow?._raw ? (
                                    <button
                                        className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            const raw = detailRow?._raw || {}
                                            const id = typeof raw.id === 'string' ? raw.id : (typeof raw._id === 'string' ? raw._id : undefined)
                                            if (!id) return
                                            setEditId(id)
                                            setEditForm({
                                                id,
                                                client_id: (typeof raw.client_id === 'string' ? raw.client_id : (getId(raw.client))),
                                                equipment_id: (typeof raw.equipment_id === 'string' ? raw.equipment_id : (getId(raw.equipment))),
                                                pilot_id: (typeof raw.pilot_id === 'string' ? raw.pilot_id : (getId(raw.pilot))),
                                                start_date: (typeof raw.start_date === 'string' ? raw.start_date : undefined),
                                                end_date: (typeof raw.end_date === 'string' ? raw.end_date : undefined),
                                                status: (typeof raw.status === 'string' ? raw.status : undefined)
                                            })
                                            setEditErrors({})
                                            setDetailOpen(false)
                                            setEditOpen(true)
                                        }}
                                    >
                                        {t('buttons.edit')}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Portal>
            ) : null}
        </div>
    )
}
