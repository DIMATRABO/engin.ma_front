import {http} from '@/services/http'
import type {InputForm} from '@/types/api'

export type ChangeStatusForm = { id: string; status?: string }
export type DeleteUser = { id: string }

export const usersService = {
    list: (input: InputForm) => http.post<unknown>('/users/', input),
    changeStatus: (payload: ChangeStatusForm) => http.put<unknown, ChangeStatusForm>('/users/change_status', payload),
    delete: (payload: DeleteUser) => http.delete<unknown, DeleteUser>('/users/delete', payload),
}
