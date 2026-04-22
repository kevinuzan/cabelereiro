import { methods, request } from '../../utils/http.js'

export const config = {
    get: () => request('/api/admin/config'),
    save: (duration, professionals) => request('/api/admin/config', {
        method: methods.post,
        body: JSON.stringify({
            tempoCorte: duration,
            profissionais: professionals,
        })
    }),
};