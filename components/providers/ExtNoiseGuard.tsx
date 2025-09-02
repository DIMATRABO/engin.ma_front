"use client"

import React from 'react'

// Known noisy messages produced by some autofill/security extensions.
const KNOWN_NOISE_SUBSTRINGS = [
    "Duplicate script ID 'fido2-page-script-registration'",
    'triggerAutofillScriptInjection',
    'The page keeping the extension port is moved into back/forward cache',
    // Handle extension overlay race on navigation
    "Failed to execute 'insertBefore' on 'Node'",
    'NotFoundError',
    'bootstrap-autofill-overlay.js',
] as const

function messageMatchesNoise(message?: unknown): boolean {
    const extracted = (() => {
        if (typeof message === 'string') return message
        if (message && typeof message === 'object' && 'message' in message) {
            const m = (message as { message?: unknown }).message
            return typeof m === 'string' ? m : undefined
        }
        return undefined
    })()
    if (!extracted) return false
    return KNOWN_NOISE_SUBSTRINGS.some((s) => extracted.includes(s))
}

export function ExtNoiseGuard() {
    React.useEffect(() => {
        // 1) Deduplicate known duplicate-injected FIDO2 script nodes by id
        const ID = 'fido2-page-script-registration'
        const dedupe = () => {
            try {
                const nodes = document.querySelectorAll(`#${CSS.escape(ID)}`)
                if (nodes.length > 1) {
                    // Keep the first one, remove the rest
                    nodes.forEach((node, idx) => {
                        if (idx > 0 && node.parentNode) {
                            node.parentNode.removeChild(node)
                        }
                    })
                }
            } catch {
                // ignore
            }
        }

        dedupe()

        const mo = new MutationObserver(() => dedupe())
        mo.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true,
        })

        // 2) Suppress known extension-origin errors in console to reduce noise
        const prevOnError = window.onerror
        const prevOnUnhandledRejection = window.onunhandledrejection

        const onErrorHandler: OnErrorEventHandler = function (message, source, lineno, colno, error) {
            if (messageMatchesNoise(message) || messageMatchesNoise(error)) {
                return true // returning true prevents the default handler (and console noise)
            }
            return prevOnError ? prevOnError(message, source, lineno, colno, error) : undefined
        }

        const onUnhandledRejection = function (event: PromiseRejectionEvent) {
            if (messageMatchesNoise(event?.reason)) {
                event.preventDefault()
                return true
            }
            return prevOnUnhandledRejection ? prevOnUnhandledRejection.call(window, event) : undefined
        }

        window.onerror = onErrorHandler
        window.onunhandledrejection = onUnhandledRejection

        return () => {
            try {
                mo.disconnect()
            } catch {
            }
            // restore previous handlers
            window.onerror = prevOnError || null
            window.onunhandledrejection = prevOnUnhandledRejection || null
        }
    }, [])

    return null
}
