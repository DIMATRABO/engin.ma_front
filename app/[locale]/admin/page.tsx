'use client'

import React from 'react'
import {useTranslations} from 'next-intl'

export default function AdminHomePage() {
    const t = useTranslations('admin.dashboard')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">{t('title')}</h1>
                <p className="text-sm text-gray-500">{t('welcome')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 bg-white">
                    <p className="text-xs text-gray-500">KPI</p>
                    <p className="font-medium mt-1">Equipments</p>
                    <div className="text-2xl font-semibold mt-2">—</div>
                </div>
                <div className="rounded-lg border p-4 bg-white">
                    <p className="text-xs text-gray-500">KPI</p>
                    <p className="font-medium mt-1">Users</p>
                    <div className="text-2xl font-semibold mt-2">—</div>
                </div>
                <div className="rounded-lg border p-4 bg-white">
                    <p className="text-xs text-gray-500">KPI</p>
                    <p className="font-medium mt-1">Bookings</p>
                    <div className="text-2xl font-semibold mt-2">—</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 bg-white">
                    <p className="text-sm text-gray-700">{t('equipmentsComing')}</p>
                </div>
                <div className="rounded-lg border p-4 bg-white">
                    <p className="text-sm text-gray-700">{t('usersComing')}</p>
                </div>
            </div>
        </div>
    )
}
