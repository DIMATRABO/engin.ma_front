"use client"

import React from 'react'
import {useRouter} from '@/i18n/navigation'
import {useTranslations} from 'next-intl'
import {ownersService} from '@/services/owners'
import {type SignUp, usersService} from '@/services/users'
import {type CreateEquipment, equipmentsService} from '@/services/equipments'
import {http} from '@/services/http'
import {refsService} from '@/services/refs'

// Minimal 4-step Equipment Wizard (P1)
// Steps:
// 1) Select or create Owner (dropdown + inline form)
// 2) Select or create Pilot (dropdown + inline form, single required)
// 3) Create Equipment (reuses minimal fields like title/price/availability)
// 4) Upload Images (navigate to existing images page)
//
// Notes:
// - We preload owners via ownersService.listAll() and pilots via the dedicated BFF endpoint (/api/pilotes)
// - We mirror critical state into the URL (step, ownerId, pilotId, equipmentId) for refresh resilience
// - Keep UI simple and mobile-first; reuse project button styles


// Normalize user label for dropdowns
function labelOf(u: any): string {
    const name = u?.full_name ?? u?.fullname ?? u?.name ?? u?.username ?? '-'
    const email = u?.email ? ` — ${u.email}` : ''
    return `${name}${email}`
}

export default function EquipmentWizardPage() {
    const t = useTranslations('admin.equipments')
    const router = useRouter()

    // URL sync
    const [step, setStep] = React.useState<number>(1) // 1..4
    const [ownerId, setOwnerId] = React.useState<string>('')
    const [pilotId, setPilotId] = React.useState<string>('')
    const [equipmentId, setEquipmentId] = React.useState<string>('')

    // Lists
    const [owners, setOwners] = React.useState<any[]>([])
    const [pilots, setPilots] = React.useState<any[]>([])
    const [loadingOwners, setLoadingOwners] = React.useState<boolean>(true)
    const [loadingPilots, setLoadingPilots] = React.useState<boolean>(true)
    const [errOwners, setErrOwners] = React.useState<string | null>(null)
    const [errPilots, setErrPilots] = React.useState<string | null>(null)

    // Step 3 form (reuse minimal fields used in /admin/equipments/new)
    const [title, setTitle] = React.useState('')
    const [pricePerDay, setPricePerDay] = React.useState('')
    const [isAvailable, setIsAvailable] = React.useState(true)

    // Additional equipment fields
    const [brandId, setBrandId] = React.useState('')
    const [modelId, setModelId] = React.useState('')
    const [cityId, setCityId] = React.useState('')
    const [modelYear, setModelYear] = React.useState('')
    const [constructionYear, setConstructionYear] = React.useState('')
    const [clearanceYear, setClearanceYear] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [foa, setFoa] = React.useState('')

    // Reference lists
    const [brands, setBrands] = React.useState<any[]>([])
    const [models, setModels] = React.useState<any[]>([])
    const [cities, setCities] = React.useState<any[]>([])
    const [foaList, setFoaList] = React.useState<string[]>([])
    const [categories, setCategories] = React.useState<any[]>([])
    const [categoryId, setCategoryId] = React.useState('')

    const [creating, setCreating] = React.useState(false)
    const [createError, setCreateError] = React.useState<string | null>(null)

    // Inline create forms visibility
    const [showOwnerCreate, setShowOwnerCreate] = React.useState(false)
    const [showPilotCreate, setShowPilotCreate] = React.useState(false)

    // Inline create owner/pilot state
    const [newUser, setNewUser] = React.useState<{
        username: string
        password: string
        fullname: string
        email: string
    }>({username: '', password: '', fullname: '', email: ''})
    const [submittingUser, setSubmittingUser] = React.useState(false)
    const [userError, setUserError] = React.useState<string | null>(null)

    // Initialize from URL on first mount
    React.useEffect(() => {
        try {
            const sp = new URLSearchParams(window.location.search)
            const s = parseInt(sp.get('step') || '1', 10)
            const o = sp.get('ownerId') || ''
            const p = sp.get('pilotId') || ''
            const e = sp.get('equipmentId') || ''
            if (Number.isFinite(s)) setStep(Math.min(4, Math.max(1, s)))
            if (o) setOwnerId(o)
            if (p) setPilotId(p)
            if (e) setEquipmentId(e)
        } catch {
            // ignore
        }
    }, [])

    // Sync to URL on changes (debounced)
    React.useEffect(() => {
        const id = setTimeout(() => {
            const sp = new URLSearchParams()
            sp.set('step', String(step))
            if (ownerId) sp.set('ownerId', ownerId)
            if (pilotId) sp.set('pilotId', pilotId)
            if (equipmentId) sp.set('equipmentId', equipmentId)
            const qs = sp.toString()
            window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
        }, 150)
        return () => clearTimeout(id)
    }, [step, ownerId, pilotId, equipmentId])

    // Load owners & pilots
    const reloadOwners = React.useCallback(async (): Promise<any[]> => {
        setErrOwners(null)
        setLoadingOwners(true)
        try {
            const res = await ownersService.listAll()
            const list = Array.isArray((res as any)?.data) ? (res as any).data : (res as any)
            const normalized = Array.isArray(list) ? list : []
            setOwners(normalized)
            return normalized
        } catch (e: any) {
            setErrOwners(e?.message ?? 'Failed to load owners')
            return []
        } finally {
            setLoadingOwners(false)
        }
    }, [])

    const reloadPilots = React.useCallback(async (): Promise<any[]> => {
        setErrPilots(null)
        setLoadingPilots(true)
        try {
            // Use dedicated pilots endpoint via BFF to ensure auth token is attached
            const res = await http.get<any>('/api/pilotes')
            const data: any = (res as any)?.data
            const list: any[] = Array.isArray(data?.items)
                ? data.items
                : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))
            const normalized = Array.isArray(list) ? list : []
            setPilots(normalized)
            return normalized
        } catch (e: any) {
            setErrPilots(e?.message ?? 'Failed to load pilots')
            return []
        } finally {
            setLoadingPilots(false)
        }
    }, [])

    React.useEffect(() => {
        reloadOwners()
        reloadPilots()
    }, [reloadOwners, reloadPilots])

    // Load reference lists for Step 3 (brands, models, cities, fields of activity)
    React.useEffect(() => {
        let active = true
        ;(async () => {
            try {
                const [b, m, c, f, cat] = await Promise.allSettled([
                    refsService.getBrands(),
                    refsService.getModels(),
                    refsService.getCities(),
                    refsService.getFoa(),
                    refsService.getCategories(),
                ])
                if (!active) return
                if (b.status === 'fulfilled') {
                    const bd: any = (b.value as any)?.data
                    setBrands(Array.isArray(bd) ? bd : (Array.isArray(b.value as any) ? (b.value as any) : []))
                }
                if (m.status === 'fulfilled') {
                    const md: any = (m.value as any)?.data
                    setModels(Array.isArray(md) ? md : (Array.isArray(m.value as any) ? (m.value as any) : []))
                }
                if (c.status === 'fulfilled') {
                    const cd: any = (c.value as any)?.data
                    setCities(Array.isArray(cd) ? cd : (Array.isArray(c.value as any) ? (c.value as any) : []))
                }
                if (f.status === 'fulfilled') {
                    const fd: any = (f.value as any)?.data
                    setFoaList(Array.isArray(fd) ? fd as string[] : (Array.isArray(f.value as any) ? (f.value as any) as string[] : []))
                }
                if (cat.status === 'fulfilled') {
                    const cad: any = (cat.value as any)?.data
                    setCategories(Array.isArray(cad) ? cad : (Array.isArray(cat.value as any) ? (cat.value as any) : []))
                }
            } catch {
                // ignore ref loading errors for now; UI can still work with minimal fields
            }
        })()
        return () => {
            active = false
        }
    }, [])

    // Keep model selection consistent with brand
    React.useEffect(() => {
        if (!brandId || !modelId) return
        const matches = (m: any) => {
            const bid = m?.brand_id ?? (typeof m?.brand === 'object' ? (m.brand?.id ?? m.brand?._id) : undefined)
            return bid === brandId
        }
        const exists = models.some(matches)
        if (!exists) setModelId('')
    }, [brandId, modelId, models])

    const filteredModels = React.useMemo(() => {
        if (!brandId) return models
        return models.filter((m: any) => {
            const bid = m?.brand_id ?? (typeof m?.brand === 'object' ? (m.brand?.id ?? m.brand?._id) : undefined)
            return bid === brandId
        })
    }, [models, brandId])

    function nextDisabled(): boolean {
        if (step === 1) return !ownerId
        if (step === 2) return !pilotId
        if (step === 3) return !(title.trim() && pricePerDay.trim() && !isNaN(Number(pricePerDay)) && !!categoryId)
        return false
    }

    function goNext() {
        if (nextDisabled()) return
        setStep((s) => Math.min(4, s + 1))
    }

    function goBack() {
        setStep((s) => Math.max(1, s - 1))
    }

    async function submitUser(role: 'OWNER' | 'PILOT') {
        setUserError(null)
        setSubmittingUser(true)
        try {
            const payload: SignUp = {
                username: newUser.username,
                password: newUser.password,
                fullname: newUser.fullname,
                email: newUser.email,
                role,
            }
            await usersService.create(payload)

            const matchBy = (u: any) => {
                const uName = (u?.username ?? '').toLowerCase()
                const uEmail = (u?.email ?? '').toLowerCase()
                const uFull = (u?.full_name ?? u?.fullname ?? '').toLowerCase()
                return (newUser.username && uName === newUser.username.toLowerCase())
                    || (newUser.email && uEmail === newUser.email.toLowerCase())
                    || (newUser.fullname && uFull === newUser.fullname.toLowerCase())
            }

            if (role === 'OWNER') {
                const list = await reloadOwners()
                const match = list.find(matchBy)
                if (match?.id) {
                    setOwnerId(match.id)
                }
                setShowOwnerCreate(false)
                setStep(2) // Auto-advance to Pilot step
            } else {
                const list = await reloadPilots()
                const match = list.find(matchBy)
                if (match?.id) {
                    setPilotId(match.id)
                }
                setShowPilotCreate(false)
                setStep(3) // Auto-advance to Equipment step
            }
            // Reset form
            setNewUser({username: '', password: '', fullname: '', email: ''})
        } catch (e: any) {
            setUserError(e?.message ?? 'Failed to create user')
        } finally {
            setSubmittingUser(false)
        }
    }

    async function onCreateEquipment() {
        setCreateError(null)
        setCreating(true)
        try {
            const toInt = (s: string) => {
                const n = parseInt(String(s), 10)
                return Number.isFinite(n) ? n : undefined
            }
            const payload: CreateEquipment = {
                owner_id: ownerId || undefined,
                pilot_id: pilotId || undefined,
                brand_id: brandId || undefined,
                model_id: modelId || undefined,
                category_id: categoryId || undefined,
                city_id: cityId || undefined,
                model_year: toInt(modelYear),
                construction_year: toInt(constructionYear),
                date_of_customs_clearance: toInt(clearanceYear),
                title: title.trim(),
                description: description.trim() || undefined,
                fields_of_activity: foa || undefined,
                price_per_day: Number(pricePerDay),
                is_available: Boolean(isAvailable),
            }
            const res = await equipmentsService.create(payload)
            const data: any = (res as any)?.data
            const newId: string =
                typeof data === 'string' ? data :
                    (data?.id ?? data?._id ?? data?.data?.id ?? data?.data?._id ?? data?.equipment?.id ?? '')

            if (!newId) throw new Error('Backend did not return equipment id')

            setEquipmentId(newId)
            setStep(4)
        } catch (e: any) {
            setCreateError(e?.message ?? 'Failed to create equipment')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header
                className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
                <div className="max-w-screen-md mx-auto flex items-center justify-between gap-2">
                    <button
                        onClick={() => router.push('/admin/equipments')}
                        className="inline-flex items-center rounded-md border border-input bg-background px-3 h-9 text-sm"
                        aria-label={t('wizard.backToListAria')}
                    >
                        {`← ${t('wizard.back')}`}
                    </button>
                    <h1 className="text-base font-medium">{t('wizard.title')}</h1>
                    <div className="w-[82px]" aria-hidden/>
                </div>
            </header>

            {/* Stepper */}
            <div className="px-4 pt-3">
                <div className="max-w-screen-md mx-auto grid grid-cols-4 gap-2" role="tablist"
                     aria-label={t('wizard.stepperAria')}>
                    {[1, 2, 3, 4].map((i) => (
                        <button key={i} role="tab" aria-selected={step === i} onClick={() => setStep(i)}
                                className={`h-2 w-full rounded-full ${step === i ? 'bg-primary' : 'bg-muted'}`}
                                aria-label={t('wizard.stepAria', {step: i})}/>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 px-4 pb-24 pt-4">
                <div className="max-w-screen-md mx-auto">
                    {step === 1 && (
                        <section className="space-y-4" aria-labelledby="owner-step">
                            <h2 id="owner-step" className="text-lg font-semibold">{t('wizard.stepHeader', {
                                current: 1,
                                total: 4,
                                label: t('labels.owner')
                            })}</h2>
                            {loadingOwners ? (
                                <div className="text-sm text-muted-foreground">{t('wizard.loadingOwners')}</div>
                            ) : errOwners ? (
                                <div className="text-sm text-destructive">
                                    {errOwners}
                                    <div className="mt-2">
                                        <button onClick={reloadOwners}
                                                className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm">{t('buttons.retry')}</button>
                                    </div>
                                </div>
                            ) : owners.length === 0 ? (
                                <div className="text-sm text-muted-foreground">{t('wizard.noOwners')}</div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('labels.owner')}</label>
                                    <select
                                        className="w-full h-10 border border-input bg-background rounded-md px-2 text-sm"
                                        value={ownerId}
                                        onChange={(e) => setOwnerId(e.target.value)}>
                                        <option value="">{t('wizard.selectOwnerPlaceholder')}</option>
                                        {owners.map((o, idx) => (
                                            <option key={o?.id ?? idx} value={o?.id ?? ''}>{labelOf(o)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="pt-2">
                                <button onClick={() => {
                                    setShowOwnerCreate((v) => !v);
                                    setUserError(null);
                                }}
                                        className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {showOwnerCreate ? t('wizard.toggleClose') : t('wizard.createOwnerToggleOpen')}
                                </button>
                            </div>

                            {showOwnerCreate && (
                                <div className="rounded-md border p-3 space-y-2">
                                    {userError && <div className="text-sm text-destructive">{userError}</div>}
                                    <div>
                                        <label className="block text-sm mb-1">{t('wizard.user.fullname')}</label>
                                        <input
                                            className="w-full h-9 border border-input bg-background rounded-md px-2 text-sm"
                                            value={newUser.fullname}
                                            onChange={(e) => setNewUser((u) => ({...u, fullname: e.target.value}))}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">{t('wizard.user.email')}</label>
                                        <input
                                            className="w-full h-9 border border-input bg-background rounded-md px-2 text-sm"
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser((u) => ({...u, email: e.target.value}))}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm mb-1">{t('wizard.user.username')}</label>
                                            <input
                                                className="w-full h-9 border border-input bg-background rounded-md px-2 text-sm"
                                                value={newUser.username}
                                                onChange={(e) => setNewUser((u) => ({
                                                    ...u,
                                                    username: e.target.value
                                                }))}/>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1">{t('wizard.user.password')}</label>
                                            <input
                                                className="w-full h-9 border border-input bg-background rounded-md px-2 text-sm"
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser((u) => ({
                                                    ...u,
                                                    password: e.target.value
                                                }))}/>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button disabled={submittingUser} onClick={() => submitUser('OWNER')}
                                                className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50">
                                            {submittingUser ? t('wizard.creating') : t('wizard.createOwner')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {step === 2 && (
                        <section className="space-y-4" aria-labelledby="pilot-step">
                            <h2 id="pilot-step" className="text-lg font-semibold">{t('wizard.stepHeader', {
                                current: 2,
                                total: 4,
                                label: t('labels.pilot')
                            })}</h2>
                            {loadingPilots ? (
                                <div className="text-sm text-muted-foreground">{t('wizard.loadingPilots')}</div>
                            ) : errPilots ? (
                                <div className="text-sm text-destructive">
                                    {errPilots}
                                    <div className="mt-2">
                                        <button onClick={reloadPilots}
                                                className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm">{t('buttons.retry')}</button>
                                    </div>
                                </div>
                            ) : pilots.length === 0 ? (
                                <div className="text-sm text-muted-foreground">{t('wizard.noPilots')}</div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('labels.pilot')}</label>
                                    <select
                                        className="w-full h-10 border border-input bg-background rounded-md px-2 text-sm"
                                        value={pilotId}
                                        onChange={(e) => setPilotId(e.target.value)}>
                                        <option value="">{t('wizard.selectPilotPlaceholder')}</option>
                                        {pilots.map((p, idx) => (
                                            <option key={p?.id ?? idx} value={p?.id ?? ''}>{labelOf(p)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="pt-2">
                                <button onClick={() => {
                                    setShowPilotCreate((v) => !v);
                                    setUserError(null);
                                }}
                                        className="inline-flex items-center h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {showPilotCreate ? t('wizard.toggleClose') : t('wizard.createPilotToggleOpen')}
                                </button>
                            </div>

                            {showPilotCreate && (
                                <div className="rounded-md border p-3 space-y-2">
                                    {userError && <div className="text-sm text-destructive">{userError}</div>}
                                    <div>
                                        <label className="block text-sm mb-1">{t('wizard.user.fullname')}</label>
                                        <input
                                            className="w-full h-9 border border-input bg-background rounded-md px-2 text-sm"
                                            value={newUser.fullname}
                                            onChange={(e) => setNewUser((u) => ({...u, fullname: e.target.value}))}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">{t('wizard.user.email')}</label>
                                        <input
                                            className="w-full h-9 border border-input bg-background rounded-md px-2 text-sm"
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser((u) => ({...u, email: e.target.value}))}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm mb-1">{t('wizard.user.username')}</label>
                                            <input
                                                className="w-full h-9 border border-input bg-background rounded-md px-2 text-sm"
                                                value={newUser.username}
                                                onChange={(e) => setNewUser((u) => ({
                                                    ...u,
                                                    username: e.target.value
                                                }))}/>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1">{t('wizard.user.password')}</label>
                                            <input
                                                className="w-full h-9 border border-input bg-background rounded-md px-2 text-sm"
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser((u) => ({
                                                    ...u,
                                                    password: e.target.value
                                                }))}/>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button disabled={submittingUser} onClick={() => submitUser('PILOT')}
                                                className="inline-flex items-center h-9 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50">
                                            {submittingUser ? t('wizard.creating') : t('wizard.createPilot')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {step === 3 && (
                        <section className="space-y-4" aria-labelledby="equipment-step">
                            <h2 id="equipment-step" className="text-lg font-semibold">{t('wizard.stepHeader', {
                                current: 3,
                                total: 4,
                                label: t('wizard.labels.equipment')
                            })}</h2>

                            <div className="rounded-md border p-3 text-sm space-y-1 bg-muted/30">
                                <div className="flex justify-between"><span
                                    className="text-muted-foreground">{t('labels.owner')}</span><span
                                    className="font-medium">{owners.find(o => o?.id === ownerId)?.full_name ?? owners.find(o => o?.id === ownerId)?.fullname ?? ownerId}</span>
                                </div>
                                <div className="flex justify-between"><span
                                    className="text-muted-foreground">{t('labels.pilot')}</span><span
                                    className="font-medium">{pilots.find(p => p?.id === pilotId)?.full_name ?? pilots.find(p => p?.id === pilotId)?.fullname ?? pilotId}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('table.title')}</label>
                                <input className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm"
                                       placeholder={t('wizard.placeholders.titleEg')}
                                       value={title}
                                       onChange={(e) => setTitle(e.target.value)}/>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('table.brand')}</label>
                                    <select
                                        className="w-full h-10 border border-input bg-background rounded-md px-2 text-sm"
                                        value={brandId}
                                        onChange={(e) => {
                                            setBrandId(e.target.value);
                                        }}>
                                        <option value="">{t('wizard.placeholders.selectBrand')}</option>
                                        {brands.map((b: any, idx: number) => {
                                            const id = b?.id ?? b?._id ?? ''
                                            const name = b?.name ?? '-'
                                            return <option key={id || idx} value={id}>{name}</option>
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('table.model')}</label>
                                    <select
                                        className="w-full h-10 border border-input bg-background rounded-md px-2 text-sm"
                                        value={modelId}
                                        onChange={(e) => setModelId(e.target.value)}
                                        disabled={filteredModels.length === 0}>
                                        <option
                                            value="">{filteredModels.length === 0 ? t('wizard.placeholders.selectBrandFirst') : t('wizard.placeholders.selectModel')}</option>
                                        {filteredModels.map((m: any, idx: number) => {
                                            const id = m?.id ?? m?._id ?? ''
                                            const name = m?.name ?? '-'
                                            return <option key={id || idx} value={id}>{name}</option>
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('labels.category')}</label>
                                <select
                                    className="w-full h-10 border border-input bg-background rounded-md px-2 text-sm"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}>
                                    <option value="">{t('wizard.placeholders.selectCategory')}</option>
                                    {categories.map((c: any, idx: number) => {
                                        const id = c?.id ?? c?._id ?? ''
                                        const name = c?.name ?? c?.name_en ?? c?.name_fr ?? c?.name_ar ?? '-'
                                        return <option key={id || idx} value={id}>{name}</option>
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('table.city')}</label>
                                <select
                                    className="w-full h-10 border border-input bg-background rounded-md px-2 text-sm"
                                    value={cityId}
                                    onChange={(e) => setCityId(e.target.value)}>
                                    <option value="">{t('wizard.placeholders.selectCity')}</option>
                                    {cities.map((c: any, idx: number) => {
                                        const id = c?.id ?? c?._id ?? ''
                                        const name = c?.name ?? c?.name_en ?? c?.name_fr ?? c?.name_ar ?? '-'
                                        return <option key={id || idx} value={id}>{name}</option>
                                    })}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('labels.modelYear')}</label>
                                    <input
                                        className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm"
                                        inputMode="numeric" pattern="[0-9]*"
                                        placeholder={t('wizard.placeholders.yearExample', {year: '2020'})}
                                        value={modelYear}
                                        onChange={(e) => setModelYear(e.target.value.replace(/[^0-9]/g, ''))}/>
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-1">{t('labels.constructionYear')}</label>
                                    <input
                                        className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm"
                                        inputMode="numeric" pattern="[0-9]*"
                                        placeholder={t('wizard.placeholders.yearExample', {year: '2019'})}
                                        value={constructionYear}
                                        onChange={(e) => setConstructionYear(e.target.value.replace(/[^0-9]/g, ''))}/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('labels.customsYear')}</label>
                                    <input
                                        className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm"
                                        inputMode="numeric" pattern="[0-9]*"
                                        placeholder={t('wizard.placeholders.yearExample', {year: '2021'})}
                                        value={clearanceYear}
                                        onChange={(e) => setClearanceYear(e.target.value.replace(/[^0-9]/g, ''))}/>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('labels.fieldsOfActivity')}</label>
                                <select
                                    className="w-full h-10 border border-input bg-background rounded-md px-2 text-sm"
                                    value={foa}
                                    onChange={(e) => setFoa(e.target.value)}>
                                    <option value="">{t('wizard.placeholders.select')}</option>
                                    {foaList.map((val) => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('labels.description')}</label>
                                <textarea
                                    className="w-full min-h-24 border border-input bg-background rounded-md px-3 py-2 text-sm"
                                    placeholder={t('wizard.placeholders.description')}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}/>
                            </div>

                            <div>
                                <label
                                    className="block text-sm font-medium mb-1">{t('wizard.labels.pricePerDayMad')}</label>
                                <input className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm"
                                       inputMode="numeric" pattern="[0-9]*"
                                       placeholder={t('wizard.placeholders.priceEg')}
                                       value={pricePerDay}
                                       onChange={(e) => setPricePerDay(e.target.value)}/>
                            </div>

                            <div className="flex items-center gap-2">
                                <input id="is_available" type="checkbox" className="h-4 w-4" checked={isAvailable}
                                       onChange={(e) => setIsAvailable(e.target.checked)}/>
                                <label htmlFor="is_available" className="text-sm">{t('table.available')}</label>
                            </div>

                            {createError && <div className="text-sm text-destructive">{createError}</div>}
                        </section>
                    )}

                    {step === 4 && (
                        <section className="space-y-4" aria-labelledby="images-step">
                            <h2 id="images-step" className="text-lg font-semibold">{t('wizard.stepHeader', {
                                current: 4,
                                total: 4,
                                label: t('wizard.labels.images')
                            })}</h2>
                            {!equipmentId ? (
                                <div className="text-sm text-destructive">{t('wizard.images.missingId')}</div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">{t('wizard.images.instructions')}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/admin/equipments/${encodeURIComponent(equipmentId)}/images`)}
                                            className="inline-flex items-center h-10 rounded-md bg-primary text-primary-foreground px-3 text-sm"
                                        >{t('wizard.images.openPage')}</button>
                                        <button
                                            onClick={() => router.push('/admin/equipments')}
                                            className="inline-flex items-center h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        >{t('wizard.images.finish')}</button>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>

            {/* Footer actions */}
            <footer
                className="fixed inset-x-0 bottom-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3"
                style={{paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)'}}>
                <div className="max-w-screen-md mx-auto flex items-center gap-2">
                    {step > 1 && (
                        <button onClick={goBack}
                                className="inline-flex items-center justify-center h-10 rounded-md border border-input bg-background px-3 text-sm min-w-24">
                            {t('wizard.back')}
                        </button>
                    )}
                    {step < 3 && (
                        <button onClick={goNext}
                                className="inline-flex items-center justify-center h-10 rounded-md bg-primary text-primary-foreground px-3 text-sm min-w-24 disabled:opacity-50"
                                disabled={nextDisabled()}>
                            {t('wizard.next')}
                        </button>
                    )}
                    {step === 3 && (
                        <button onClick={onCreateEquipment}
                                className="inline-flex items-center justify-center h-10 rounded-md bg-primary text-primary-foreground px-3 text-sm min-w-24 disabled:opacity-50"
                                disabled={creating || nextDisabled()}>
                            {creating ? t('wizard.creating') : t('buttons.create')}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    )
}
