'use client'

import React from 'react'
import {useParams} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {useQuery} from '@tanstack/react-query'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import {toast} from 'sonner'
import Portal from '@/components/ui/Portal'

type ImgItem = { id?: string; url?: string }

export default function EquipmentImagesPage() {
    const t = useTranslations('admin.equipments')
    const params = useParams<{ equipment_id: string }>()
    const equipmentId = params?.equipment_id as string

    const {data, isFetching, refetch} = useQuery<ImgItem[]>({
        queryKey: ['equipment-images', equipmentId],
        enabled: !!equipmentId,
        queryFn: async () => {
            const res = await fetch(`/api/equipment-images/by-equipment/${encodeURIComponent(equipmentId)}`)
            if (!res.ok) throw new Error('Failed to load images')
            const arr = await res.json().then(v => (Array.isArray(v) ? v : []))
            return arr as ImgItem[]
        },
    })

    // Image viewer (lightbox) state
    const [viewerOpen, setViewerOpen] = React.useState(false)
    const [viewerIndex, setViewerIndex] = React.useState<number>(0)
    const items = data ?? []

    function openViewer(index: number) {
        setViewerIndex(index)
        setViewerOpen(true)
    }

    function closeViewer() {
        setViewerOpen(false)
    }

    function nextImg() {
        if (items.length === 0) return
        setViewerIndex((i) => (i + 1) % items.length)
    }

    function prevImg() {
        if (items.length === 0) return
        setViewerIndex((i) => (i - 1 + items.length) % items.length)
    }

    React.useEffect(() => {
        if (!viewerOpen) return

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeViewer()
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextImg()
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevImg()
            }
        }

        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [viewerOpen, items.length])

    // Delete confirmation dialog state
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [toDeleteId, setToDeleteId] = React.useState<string | undefined>(undefined)
    const [uploading, setUploading] = React.useState(false)

    async function doDelete() {
        const id = toDeleteId
        if (!id) return
        const res = await fetch('/api/equipment-images', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id}),
        })
        if (!res.ok) {
            const msg = await res.text().catch(() => '')
            toast.error(msg || 'Failed to delete image')
            return
        }
        toast.success(t('buttons.delete'))
        setToDeleteId(undefined)
        await refetch()
    }

    async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const fd = new FormData()
        fd.append('file', file)
        fd.append('equipment_id', equipmentId)
        setUploading(true)
        try {
            const res = await fetch('/api/equipment-images/add', {method: 'POST', body: fd})
            if (!res.ok) {
                const msg = await res.text().catch(() => '')
                toast.error(msg || 'Upload failed')
                return
            }
            toast.success(t('buttons.upload'))
            await refetch()
        } finally {
            setUploading(false)
            // Reset the input value to allow uploading the same file again if needed
            try {
                e.currentTarget.value = ''
            } catch {
            }
        }
    }


    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t('imagesTitle')}</h1>
                <p className="text-sm text-muted-foreground">{t('imagesSubtitle')}</p>
            </div>

            <div className="rounded-lg border bg-card p-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{t('imagesHint')}</div>
                <label
                    className={`inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? 'Uploading…' : t('buttons.upload')}
                    <input type="file" className="hidden" onChange={onUpload} accept="image/*" disabled={uploading}/>
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(data ?? []).map((img, idx) => (
                    <div key={img.id || idx} className="rounded-lg border overflow-hidden">
                        <button
                            type="button"
                            onClick={() => openViewer(idx)}
                            className="block w-full aspect-video bg-muted focus:outline-none"
                            aria-label="Open image"
                        >
                            {img.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={`/api/equipment-images/${encodeURIComponent(img.url)}`} alt="img"
                                     className="w-full h-full object-cover"/>
                            ) : null}
                        </button>
                        <div className="p-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">{img.url}</span>
                            <button onClick={() => {
                                const id = img.id;
                                if (!id) return;
                                setToDeleteId(String(id));
                                setConfirmOpen(true);
                            }} className="text-red-600 text-xs hover:underline">
                                {t('buttons.delete')}
                            </button>
                        </div>
                    </div>
                ))}
                {!isFetching && (data ?? []).length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">{t('noImages')}</div>
                )}
            </div>

            {viewerOpen && (data ?? []).length > 0 ? (
                <Portal>
                    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[110]">
                        <div className="absolute inset-0 bg-black/80" onMouseDown={closeViewer}/>
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <div className="relative max-w-[95vw] max-h-[95vh]">
                                {(data ?? [])[viewerIndex]?.url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={`/api/equipment-images/${encodeURIComponent(((data ?? [])[viewerIndex]!.url!) as string)}`}
                                        alt={String(((data ?? [])[viewerIndex]!.url) || 'image')}
                                        className="max-w-[95vw] max-h-[95vh] object-contain rounded-md shadow-2xl"
                                    />
                                ) : null}
                                <button
                                    type="button"
                                    onClick={closeViewer}
                                    className="absolute -top-3 -end-3 h-9 w-9 rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
                                    aria-label={t('buttons.cancel')}
                                    title={t('buttons.cancel')}
                                >
                                    ✕
                                </button>
                            </div>
                            {(data ?? []).length > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={prevImg}
                                        className="absolute start-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
                                        aria-label="Previous"
                                        title="Previous"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextImg}
                                        className="absolute end-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
                                        aria-label="Next"
                                        title="Next"
                                    >
                                        ›
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </Portal>
            ) : null}

            {/* Confirm delete dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={t('buttons.confirmDelete') || 'Are you sure?'}
                confirmLabel={t('buttons.delete')}
                cancelLabel={t('buttons.cancel')}
                onConfirm={doDelete}
            />
        </div>
    )
}
