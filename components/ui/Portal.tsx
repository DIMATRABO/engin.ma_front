"use client"

import * as React from 'react'
import {createPortal} from 'react-dom'

export function Portal({children}: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null
    return createPortal(children, document.body)
}

export default Portal
