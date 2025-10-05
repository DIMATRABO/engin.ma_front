import {http} from '@/services/http'
import type {User} from '@/types/project-entities.types'

// Minimal Owners service for the wizard (P1 fix): fetch all owners via BFF.
// Calls Next.js API route, which attaches auth token to upstream request.
export const ownersService = {
    listAll: () => http.get<User[]>('/api/owners'),
}
