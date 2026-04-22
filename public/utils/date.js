export function formatDateTime(date, locale = 'en-US', options = {}) {
    return new Date(date).toLocaleString(locale, {
        dateStyle: 'short',
        timeStyle: 'short',
        ...options
    });
}

export function formatDate(date, locale = 'en-US', options = {}) {
    return new Date(date).toLocaleDateString(locale, {
        dateStyle: 'short',
        ...options
    });
}

export function formatTime(date, locale = 'en-US', options = {}) {
    return new Date(date).toLocaleTimeString(locale, {
        timeStyle: 'short',
        ...options
    });
}
