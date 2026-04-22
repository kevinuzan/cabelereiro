import { createButton } from '../src/components/button.js';
import { init as initCliente } from '../views/cliente/cliente.js';
import { init as initAdmin } from '../views/admin/admin.js';

const routes = [
    {
        id: 'client',
        label: 'Schedule',
        partial: '../views/cliente/cliente.html',
        init: initCliente,
    },
    {
        id: 'admin',
        label: 'Admin',
        partial: '../views/admin/admin.html',
        init: initAdmin,
    },
];

let currentRoute = null;

// Avaliar possibilidade de adicionar CancellationTokens ao alterar abas
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function navigateTo(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (!route || route === currentRoute) return;
    currentRoute = route;

    document.querySelectorAll('.btn--tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.route === routeId);
    });

    const root = document.getElementById('app-root');
    const label = document.createElement('p');
    label.style.color = 'var(--text-muted)';
    label.style.padding = 'var(--space-md)';
    label.textContent = 'Loading...';
    root.appendChild(label);

    try {
        const res = await fetch(route.partial);
        const html = await res.text();
        root.innerHTML = html;
        await route.init();
    } catch (err) {
        label.style = "color:var(--color-danger)";
        label.textContent = "Failed to load page.";
        console.error('Failed to load partial:', err);
    }
}

function buildNav() {
    const nav = document.getElementById('tab-nav');
    routes.forEach(route => {
        const btn = createButton({
            label: route.label,
            variant: 'tab',
            onClick: () => navigateTo(route.id),
        });
        btn.dataset.route = route.id;
        nav.appendChild(btn);
    });
}

buildNav();
navigateTo('client');
