import {NextResponse} from 'next/server'

export async function POST() {
    const resp = NextResponse.json({ok: true})
    // Clear the accessToken cookie by setting Max-Age=0
    resp.cookies.set('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    })
    return resp
}
