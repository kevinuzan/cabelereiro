import { formatDateTime } from '../../utils/date.js';

function createAppointmentItem({ cliente, profissional, data }) {
    return $('<div>')
        .addClass('appointment-item')
        .append(
            $('<span>').addClass('appointment-item__name').text(cliente),
            $('<span>').addClass('appointment-item__detail').text(`${profissional.nome} — ${formatDateTime(data)}`),
        );
}

export function renderAppointmentList(container, appointments) {
    const $container = $(container);
    $container.empty();

    if (!appointments.length) {
        $container.append(
            $('<p>').css('color', 'var(--text-muted)').text('No appointments found.')
        );
        return;
    }

    appointments.forEach(a => $container.append(createAppointmentItem(a)));
}