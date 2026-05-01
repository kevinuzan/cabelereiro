export const auth = {
    test: (password) => fetch(`/api/auth/test?password=${encodeURIComponent(password)}`),
    get: (token) => fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
    }),
    login: (email, password) => fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    }),
};