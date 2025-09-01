import Link from 'next/link'

export default function NotFound() {
    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#0f172a',
            color: 'white'
        }}>
            <div style={{maxWidth: 640, textAlign: 'center'}}>
                <h1 style={{fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem'}}>Page not found</h1>
                <p style={{opacity: 0.8, marginBottom: '1.25rem'}}>
                    The page you are looking for does not exist.
                </p>
                <Link href="/" style={{color: '#60a5fa', textDecoration: 'underline'}}>Go home</Link>
            </div>
        </div>
    )
}
