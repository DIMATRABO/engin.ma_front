'use client'

export default function GlobalError({
                                        error,
                                        reset,
                                    }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
        <body>
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#0f172a',
            color: 'white'
        }}>
            <div style={{maxWidth: 640, textAlign: 'center'}}>
                <h1 style={{fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem'}}>Something went wrong</h1>
                <p style={{opacity: 0.8, marginBottom: '1.25rem'}}>
                    {error?.message || 'An unexpected error occurred.'}
                </p>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: '#2563eb',
                        borderRadius: 8,
                        fontWeight: 600
                    }}
                >
                    Try again
                </button>
            </div>
        </div>
        </body>
        </html>
    )
}
