export function showToast(message, duration = 3000) {
    const toast = document.createElement('div');

    toast.className = 'toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}
