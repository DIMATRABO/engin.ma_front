import {http} from '@/services/http'

export type AuthUser = {
    username_or_email: string
    password: string
}

// Prefer using app/api/auth/login, but expose a direct call as well
export const authService = {
    loginDirect: (payload: AuthUser) =>
        http.post<{ accessToken?: string; [k: string]: unknown }>('/auth', payload),
}
