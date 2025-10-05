"use client"

import React from 'react'
import {useTranslations} from 'next-intl'
import {useParams, useSearchParams} from 'next/navigation'
import {useRouter} from '@/i18n/navigation'
import {toast} from 'sonner'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {bookingsService} from '@/services/bookings'

export default function BookingEditPage() {
    const t = useTranslations('admin.bookings')
    const params = useParams<{ id: string }>()
    const search = useSearchParams()
    const router = useRouter()
    const qc = useQueryClient()
    const id = (params?.id || '') as string

    const selectsQ = useQuery({
        queryKey: ['bookings', 'selects'],
        queryFn: async () => {
            const [equipmentsRes, clientsRes, pilotsRes] = await Promise.all([
                bookingsService.listEquipments(),
                bookingsService.listClients(),
                bookingsService.listPilots(),
            ])
            const equipments = Array.isArray(equipmentsRes.data) ? equipmentsRes.data : []
            const clients = Array.isArray(clientsRes.data) ? clientsRes.data : []
            const pilots = Array.isArray(pilotsRes.data) ? pilotsRes.data : []
            return {equipments, clients, pilots}
        },
        staleTime: 60_000,
        retry: false,
    })
    const opts = selectsQ.data || {equipments: [], clients: [], pilots: []}

    React.useEffect(() => {
        if (selectsQ.isError) {
            const err = selectsQ.error as any
            const msg = (typeof err?.message === 'string' && err.message) || 'Failed to load required data. Please ensure you are logged in.'
            toast.error(msg)
        }
    }, [selectsQ.isError, selectsQ.error])

    const [form, setForm] = React.useState({
        client_id: '',
        equipment_id: '',
        pilot_id: '',
        start_date: '',
        end_date: '',
        status: 'PENDING',
    })
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    React.useEffect(() => {
        if (!id) return
        try {
            const cached = qc.getQueryData(['bookings', 'byId', id]) as any | undefined
            if (cached) {
                setForm((f) => ({
                    ...f,
                    client_id: typeof cached.client_id === 'string' ? cached.client_id : (typeof cached.client?.id === 'string' ? cached.client.id : f.client_id),
                    equipment_id: typeof cached.equipment_id === 'string' ? cached.equipment_id : (typeof cached.equipment?.id === 'string' ? cached.equipment.id : f.equipment_id),
                    pilot_id: typeof cached.pilot_id === 'string' ? cached.pilot_id : (typeof cached.pilot?.id === 'string' ? cached.pilot.id : f.pilot_id),
                    start_date: typeof cached.start_date === 'string' ? cached.start_date : (typeof cached.start === 'string' ? cached.start : f.start_date),
                    end_date: typeof cached.end_date === 'string' ? cached.end_date : (typeof cached.end === 'string' ? cached.end : f.end_date),
                    status: typeof cached.status === 'string' ? cached.status : f.status,
                }))
                return
            }
        } catch {
        }
        const enc = search?.get('data')
        if (!enc) return
        try {
            const json = decodeURIComponent(escape(atob(enc)))
            const raw = JSON.parse(json) as any
            setForm((f) => ({
                ...f,
                client_id: typeof raw.client_id === 'string' ? raw.client_id : (typeof raw.client?.id === 'string' ? raw.client.id : f.client_id),
                equipment_id: typeof raw.equipment_id === 'string' ? raw.equipment_id : (typeof raw.equipment?.id === 'string' ? raw.equipment.id : f.equipment_id),
                pilot_id: typeof raw.pilot_id === 'string' ? raw.pilot_id : (typeof raw.pilot?.id === 'string' ? raw.pilot.id : f.pilot_id),
                start_date: typeof raw.start_date === 'string' ? raw.start_date : (typeof raw.start === 'string' ? raw.start : f.start_date),
                end_date: typeof raw.end_date === 'string' ? raw.end_date : (typeof raw.end === 'string' ? raw.end : f.end_date),
                status: typeof raw.status === 'string' ? raw.status : f.status,
            }))
        } catch {
        }
    }, [id, qc, search])

    function validate(): boolean {
        const e: Record<string, string> = {}
        if (!form.start_date) e.start_date = t('validation.required')
        if (!form.end_date) e.end_date = t('validation.required')
        if (form.start_date && form.end_date && form.end_date < form.start_date) e.end_date = t('validation.endAfterStart')
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const canSubmit = id && form.start_date && form.end_date

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return
        try {
            const res = await fetch('/api/bookings', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id, ...form, pilot_id: form.pilot_id || undefined}),
            })
            if (!res.ok) {
                const msg = await res.text().catch(() => '')
                toast.error(msg || t('errorUpdate'))
                return
            }
            toast.success(t('toasts.updated'))
            router.replace('/admin/bookings')
        } catch (err: any) {
            toast.error(err?.message || t('errorUpdate'))
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">{t('editTitle')}</h1>
                <p className="text-sm text-muted-foreground">{t('editSubtitle')}</p>
            </div>

            {selectsQ.isError && (
                <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
                    Failed to load users or equipments. Please make sure you are signed in and the API base URL is
                    configured.
                </div>
            )}

            <form onSubmit={onSubmit} className="grid gap-3 grid-cols-1 md:grid-cols-2">
                <div>
                    <label className="block text-xs mb-1">{t('table.client')}</label>
                    <select
                        className="h-10 w-full border rounded-md px-2 text-sm bg-background"
                        value={form.client_id}
                        onChange={(e) => setForm((f) => ({...f, client_id: e.target.value}))}
                    >
                        <option value="">--</option>
                        {opts.clients.map((c: any, idx: number) => (
                            <option key={(c.id || c._id || idx) as any} value={(c.id || c._id) as string}>
                                {c.name || c.email || c.username || '-'}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('table.equipment')}</label>
                    <select
                        className="h-10 w-full border rounded-md px-2 text-sm bg-background"
                        value={form.equipment_id}
                        onChange={(e) => setForm((f) => ({...f, equipment_id: e.target.value}))}
                    >
                        <option value="">--</option>
                        {opts.equipments.map((eq: any, idx: number) => (
                            <option key={(eq.id || eq._id || idx) as any} value={(eq.id || eq._id) as string}>
                                {eq.title || eq.name || '-'}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('table.pilot')}</label>
                    <select
                        className="h-10 w-full border rounded-md px-2 text-sm bg-background"
                        value={form.pilot_id}
                        onChange={(e) => setForm((f) => ({...f, pilot_id: e.target.value}))}
                    >
                        <option value="">--</option>
                        {opts.pilots.map((p: any, idx: number) => (
                            <option key={(p.id || p._id || idx) as any} value={(p.id || p._id) as string}>
                                {p.name || p.email || p.username || '-'}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('table.start')}</label>
                    <input type="date" className="h-10 w-full border rounded-md px-3 text-sm"
                           value={form.start_date}
                           onChange={(e) => setForm((f) => ({...f, start_date: e.target.value}))}/>
                    {errors.start_date && <p className="text-xs text-red-600 mt-1">{errors.start_date}</p>}
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('table.end')}</label>
                    <input type="date" className="h-10 w-full border rounded-md px-3 text-sm"
                           value={form.end_date}
                           onChange={(e) => setForm((f) => ({...f, end_date: e.target.value}))}/>
                    {errors.end_date && <p className="text-xs text-red-600 mt-1">{errors.end_date}</p>}
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('table.status')}</label>
                    <select
                        className="h-10 w-full border rounded-md px-2 text-sm bg-background"
                        value={form.status}
                        onChange={(e) => setForm((f) => ({...f, status: e.target.value}))}
                    >
                        <option value="PENDING">{t('status.PENDING')}</option>
                        <option value="CONFIRMED">{t('status.CONFIRMED')}</option>
                        <option value="CANCELED">{t('status.CANCELED')}</option>
                        <option value="COMPLETED">{t('status.COMPLETED')}</option>
                    </select>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
                    <button type="button" onClick={() => router.replace('/admin/bookings')}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm">{t('buttons.cancel')}</button>
                    <button type="submit" disabled={!canSubmit}
                            className="h-10 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50">{t('buttons.update')}</button>
                </div>
            </form>
        </div>
    )
}
