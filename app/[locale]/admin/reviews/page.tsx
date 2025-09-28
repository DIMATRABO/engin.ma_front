"use client"

import React from 'react'
import {useTranslations} from 'next-intl'

export default function AdminReviewsPage() {
    const t = useTranslations('admin.reviews')
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>

            {/* Placeholder content - to be replaced with actual reviews data */}
            <div className="rounded-lg border bg-card">
                <>
                    {/* Desktop Table - hidden on mobile */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                            <tr className="border-b">
                                <th className="p-3 text-start sticky top-0 bg-white">Client</th>
                                <th className="p-3 text-start sticky top-0 bg-white">Equipment</th>
                                <th className="p-3 text-start sticky top-0 bg-white">Rating</th>
                                <th className="p-3 text-start sticky top-0 bg-white">Date</th>
                                <th className="p-3 text-start sticky top-0 bg-white">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="p-3 text-center text-muted-foreground" colSpan={5}>
                                    No reviews data available yet
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards - hidden on desktop */}
                    <div className="sm:hidden space-y-2 p-4">
                        <div className="text-center text-muted-foreground">
                            No reviews data available yet
                        </div>
                    </div>
                </>
            </div>
        </div>
    )
}
