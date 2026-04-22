import { formatDateTime } from '../../utils/date.js';
import { createCx } from '../../utils/html.js';

export function createAppointmentItem({ cliente, profissional, data }) {
    const item = document.createElement('div');
    item.className = 'appointment-item';
    const cx = createCx(item.className);

    const name = document.createElement('span');
    name.className = cx.element('name');
    name.textContent = cliente;

    const detail = document.createElement('span');
    detail.className = cx.element('detail');
    detail.textContent = `${profissional.nome} - ${formatDateTime(data)}`;

    item.appendChild(name);
    item.appendChild(detail);

    return item;
}

export function renderAppointmentList(container, appointments) {
    container.innerHTML = '';

    if (!appointments.length) {
        const p = document.createElement('p');
        p.style.color = 'var(--text-muted)';
        p.textContent = 'No appointments found.';
        container.appendChild(p);
        return;
    }

    for (let i = 0; i < appointments.length; i++) {
        const item = createAppointmentItem(appointments[i]);
        container.appendChild(item);
    }
}
