export const config = {
    get: () => fetch('/api/admin/config'),
    save: (duration, professionals, services) => fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tempoCorte: duration,
            profissionais: professionals,
            servicos: services,
        }),
    }),
};