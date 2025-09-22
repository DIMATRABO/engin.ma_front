export type UploadImageForm = {
    file: File
    equipment_id: string
}

export type DeleteImageForm = { id: string }

async function parseJson<T = unknown>(res: Response): Promise<T> {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) return (await res.json()) as T
    // try text otherwise
    return (await res.text()) as unknown as T
}

export const imagesService = {
    upload: async ({file, equipment_id}: UploadImageForm) => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('equipment_id', equipment_id)
        const res = await fetch('/api/equipment-images/add', {method: 'POST', body: fd})
        if (!res.ok) throw new Error((await res.text().catch(() => 'Upload failed')) || 'Upload failed')
        return parseJson(res)
    },
    listByEquipment: async (equipmentId: string) => {
        const res = await fetch(`/api/equipment-images/by-equipment/${encodeURIComponent(equipmentId)}`)
        if (!res.ok) throw new Error((await res.text().catch(() => 'Failed to load images')) || 'Failed to load images')
        return parseJson<unknown[]>(res)
    },
    delete: async (payload: DeleteImageForm) => {
        const res = await fetch('/api/equipment-images', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.text().catch(() => 'Failed to delete image')) || 'Failed to delete image')
        return parseJson(res)
    },
    getImageUrl: (filename: string) => `/api/equipment-images/${encodeURIComponent(filename)}`,
}
