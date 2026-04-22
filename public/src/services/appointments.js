import { methods, request } from '../../utils/http.js'

export const appointments = {
    getAll: () => request('/api/agendamentos'),
    create: (data) => request('/api/agendamentos', {
        method: methods.post,
        body: JSON.stringify(data),
    }),
};