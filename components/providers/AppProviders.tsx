"use client"

import React from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {Toaster} from 'sonner'

export function AppProviders({children}: { children: React.ReactNode }) {
    const [queryClient] = React.useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        retry: 0,
                    },
                },
            }),
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" richColors closeButton/>
        </QueryClientProvider>
    )
}
