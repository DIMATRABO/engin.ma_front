"use client"

import * as React from 'react'
import {createPortal} from 'react-dom'

type ConfirmDialogProps = {
    open: boolean
    title?: React.ReactNode
    description?: React.ReactNode
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void | Promise<void>
    onOpenChange: (open: boolean) => void
    // Optional verification: require typing a specific string before enabling confirm
    verifyText?: string
    verifyPlaceholder?: string
    verifyMessage?: string
}

export function ConfirmDialog({
                                  open,
                                  title = 'Confirm',
                                  description,
                                  confirmLabel = 'Confirm',
                                  cancelLabel = 'Cancel',
                                  onConfirm,
                                  onOpenChange,
                                  verifyText,
                                  verifyPlaceholder = 'Type to confirm',
                                  verifyMessage,
                              }: ConfirmDialogProps) {
    const dialogRef = React.useRef<HTMLDivElement | null>(null)
    const [typed, setTyped] = React.useState('')
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        if (!open) return
        const prev = document.activeElement as HTMLElement | null
        dialogRef.current?.focus()
        return () => {
            prev?.focus()
        }
    }, [open])

    React.useEffect(() => {
        if (!open) setTyped('')
    }, [open])

    async function handleConfirm() {
        await onConfirm()
        onOpenChange(false)
    }

    const needsVerify = typeof verifyText === 'string' && verifyText.length > 0
    const canConfirm = !needsVerify || typed === verifyText

    const content = !open ? null : (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] flex items-center justify-center"
        >
            <div className="absolute inset-0 bg-black/40" onMouseDown={() => onOpenChange(false)}/>
            <div
                ref={dialogRef}
                tabIndex={-1}
                className="relative z-10 w-full max-w-sm rounded-lg border bg-background p-4 shadow-xl"
            >
                <div className="mb-2 text-base font-semibold">{title}</div>
                {description ? (
                    <div className="mb-4 text-sm text-muted-foreground">{description}</div>
                ) : null}
                {needsVerify ? (
                    <div className="mb-4">
                        {verifyMessage ? (
                            <div className="mb-2 text-xs text-muted-foreground">{verifyMessage}</div>
                        ) : null}
                        <input
                            autoFocus
                            className="w-full h-9 border border-input bg-background rounded-md px-3 text-sm"
                            placeholder={verifyPlaceholder}
                            value={typed}
                            onChange={(e) => setTyped(e.target.value)}
                        />
                        <div className="mt-1 text-[11px] text-muted-foreground">
                            <span>Required: </span>
                            <code className="text-xs">{verifyText}</code>
                        </div>
                    </div>
                ) : null}
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className="h-9 rounded-md bg-primary text-primary-foreground px-3 text-sm disabled:opacity-50"
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )

    if (!mounted) return null
    return createPortal(content, document.body)
}

export default ConfirmDialog
