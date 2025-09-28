"use client"

import React from 'react'
import {useTranslations} from 'next-intl'
import {useRouter} from '@/i18n/navigation'
import {useQuery} from '@tanstack/react-query'
import {bookingsService} from '@/services/bookings'
import {toast} from 'sonner'

async function fetchSelects() {
    const [equipments, clients, pilots] = await Promise.all([
        bookingsService.listEquipments?.().then((r: any) => Array.isArray(r?.data) ? r.data : []).catch(() => []),
        bookingsService.listClients?.().then((r: any) => Array.isArray(r?.data) ? r.data : []).catch(() => []),
        bookingsService.listPilots?.().then((r: any) => Array.isArray(r?.data) ? r.data : []).catch(() => []),
    ])
    return {equipments, clients, pilots}
}

export default function BookingNewPage() {
    const t = useTranslations('admin.bookings')
    const router = useRouter()

    const selectsQ = useQuery({
        queryKey: ['bookings', 'selects'],
        queryFn: fetchSelects,
        staleTime: 60_000,
    })

    const [form, setForm] = React.useState({
        client_id: '',
        equipment_id: '',
        pilot_id: '',
        start_date: '',
        end_date: '',
        status: 'PENDING',
    })

    const canSubmit = form.client_id && form.equipment_id && form.start_date && form.end_date

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!canSubmit) return
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...form, pilot_id: form.pilot_id || undefined}),
            })
            if (!res.ok) {
                const msg = await res.text().catch(() => '')
                toast.error(msg || t('errorCreate'))
                return
            }
            toast.success(t('toasts.created'))
            router.replace('/admin/bookings')
        } catch (err: any) {
            toast.error(err?.message || t('errorCreate'))
        }
    }

    const opts = selectsQ.data || {equipments: [], clients: [], pilots: []}

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">{t('newTitle')}</h1>
                <p className="text-sm text-muted-foreground">{t('newSubtitle')}</p>
            </div>

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
                            <option key={(c.id || c._id || idx) as any}
                                    value={(c.id || c._id) as string}>{c.name || c.email || c.username || '-'}</option>
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
                        {opts.equipments.map((c: any, idx: number) => (
                            <option key={(c.id || c._id || idx) as any}
                                    value={(c.id || c._id) as string}>{c.title || c.name || '-'}</option>
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
                            <option key={(p.id || p._id || idx) as any}
                                    value={(p.id || p._id) as string}>{p.name || p.email || p.username || '-'}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('table.start')}</label>
                    <input type="date" className="h-10 w-full border rounded-md px-3 text-sm" value={form.start_date}
                           onChange={(e) => setForm((f) => ({...f, start_date: e.target.value}))}/>
                </div>
                <div>
                    <label className="block text-xs mb-1">{t('table.end')}</label>
                    <input type="date" className="h-10 w-full border rounded-md px-3 text-sm" value={form.end_date}
                           onChange={(e) => setForm((f) => ({...f, end_date: e.target.value}))}/>
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
                            className="h-10 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50">{t('buttons.create')}</button>
                </div>
            </form>
        </div>
    )
}
