import { createButton } from '../src/components/button.js';
import { init as initCliente } from '../views/client/client.js';
import { init as initAdmin } from '../views/admin/admin.js';

const routes = [
    {
        id: 'client',
        label: 'Agendamento',
        partial: '../views/client/client.html',
        init: initCliente,
    },
    {
        id: 'admin',
        label: 'Administrador',
        partial: '../views/admin/admin.html',
        init: initAdmin,
    },
];

let currentRoute = null;
let cancellationToken = null;

async function navigateTo(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (!route || route === currentRoute) return;
    currentRoute = route;

    if (cancellationToken) cancellationToken.cancelled = true;
    const navigationToken = { cancelled: false };
    cancellationToken = navigationToken;

    $('.btn--tab').each(function () {
        $(this).toggleClass('active', $(this).data('route') === routeId);
    });

    const $root = $('#app-root');
    const $label = $('<p>')
        .css({color: 'var(--text-muted)', padding: 'var(--space-md)' })
        .text('Loading...');
    $root.append($label);

    try {
        const res = await fetch(route.partial);
        const html = await res.text();

        if (navigationToken.cancelled) return;

        $root.html(html);
        await route.init(navigationToken);
    } catch (err) {
        if (navigationToken.cancelled) return;
        $label.css('color', 'var(--color-danger)').text('Failed to load page.');
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