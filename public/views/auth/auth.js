import { createButton } from '../../src/components/button.js';
import { showToast } from '../../src/components/toast.js';
import { auth } from '../../src/services/auth.js';

const showResult = (data) => $('#auth-result').text(JSON.stringify(data, null, 2));
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token) => localStorage.setItem('auth_token', token);
const clearToken = () => localStorage.removeItem('auth_token');

// ------------------------------------------------------------------------------------------

function login() {
    const email = $('#auth-email').val().trim();
    const password = $('#auth-password').val();

    if (!email || !password) {
        showToast('Informe e-mail e senha.');
        return;
    }

    auth.login(email, password)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.token) {
                setToken(data.token);
                showToast('Login realizado.');
            }

            showResult(data);
        })
        .catch(err => showResult(err));
}

function loadMe() {
    const token = getToken();

    if (!token) {
        showToast('Nenhum token salvo.');
        return;
    }

    auth.get(token)
        .then(res => res.json())
        .then(data => showResult(data))
        .catch(err => showResult(err));
}

function logout() {
    clearToken();
    showToast('Token removido.');
    showResult({ success: true, message: 'Token removido.' });
}

// ------------------------------------------------------------------------------------------

function initAuth() {
    $('#btn-login-container').append(createButton({ label: 'Login', variant: 'accent', full: true, onClick: login }));
    $('#btn-me-container').append(createButton({ label: 'Testar /me', variant: 'ghost', full: true, onClick: loadMe }));
    $('#btn-logout-container').append(createButton({ label: 'Limpar token', variant: 'danger', full: true, onClick: logout }));
}

export function init(cancellationToken) {
    initAuth();
}