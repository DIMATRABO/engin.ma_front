import {http} from '@/services/http'
import type {InputForm, PagedResponse} from '@/types/api'
import type {User} from '@/types/project-entities.types'

export type ChangeStatusForm = { id: string; status?: string }
export type DeleteUser = { id: string }

// SignUp payload per swagger
export type SignUp = {
    username: string
    password: string
    fullname: string
    email: string
    birthdate?: string
    address?: string
    phoneNumber?: string
    // API expects an array of roles (required by swagger). Use the specific union for elements.
    roles: Array<'ADMIN' | 'CLIENT' | 'OWNER' | 'PILOT'>
}

export const usersService = {
    // Route through BFF so httpOnly auth cookies are applied
    list: (input: InputForm) => http.post<PagedResponse<User>, InputForm>('/api/users/list', input),
    // Convenience: list by role (fetch first 1000)
    listByRole: async (role: 'ADMIN' | 'CLIENT' | 'OWNER' | 'PILOT') => {
        const payload: InputForm = {
            pageIndex: 1,
            pageSize: 1000,
            sort: {key: 'username', order: 'asc'},
            query: '',
            filterData: {role},
        }
        return http.post<PagedResponse<User>, InputForm>('/api/users/list', payload)
    },
    create: (payload: SignUp) => http.post<unknown, SignUp>('/api/users/create', payload),
    changeStatus: (payload: ChangeStatusForm) => http.put<unknown, ChangeStatusForm>('/api/users/change_status', payload),
    delete: (payload: DeleteUser) => http.delete<unknown, DeleteUser>('/api/users/delete', payload),
}
