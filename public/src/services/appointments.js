export const appointments = {
    getAll: () => fetch('/api/agendamentos'),
    create: (data) => fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }),
};