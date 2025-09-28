"use client"

import React from 'react'
import {useTranslations} from 'next-intl'
import {useParams} from 'next/navigation'
import {useRouter} from '@/i18n/navigation'
import {toast} from 'sonner'

export default function BookingEditPage() {
    const t = useTranslations('admin.bookings')
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const id = (params?.id || '') as string

    const [form, setForm] = React.useState({
        client_id: '',
        equipment_id: '',
        pilot_id: '',
        start_date: '',
        end_date: '',
        status: 'PENDING',
    })

    const canSubmit = id && form.start_date && form.end_date

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!canSubmit) return
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

            <form onSubmit={onSubmit} className="grid gap-3 grid-cols-1 md:grid-cols-2">
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
                            className="h-10 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50">{t('buttons.update')}</button>
                </div>
            </form>
        </div>
    )
}
