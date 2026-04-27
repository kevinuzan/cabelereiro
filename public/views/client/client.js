// services
import { config } from '../../src/services/config.js';
import { appointments } from '../../src/services/appointments.js';
// components
import { createButton } from '../../src/components/button.js';
import { showToast } from '../../src/components/toast.js';

let localServices = [];
let localProfessionals = [];

// ------------------------------------------------------------------------------------------

// #region SERVICES

function fillServices() {
    const $select = $('#select-service');
    $select.empty();

    localServices.forEach(s => {
        $select.append(
            $('<option>').val(s.id).text(`${s.nome} (${s.duracao} min)`)
        );
    });

    filterProfessionalsByService();
}

// #endregion SERVICES

// ------------------------------------------------------------------------------------------

// #region TEAM

function filterProfessionalsByService() {
    const serviceId = $('#select-service').val();
    const $select = $('#select-professional');

    const filtered = localProfessionals.filter(p =>
        p.servicosIds && p.servicosIds.includes(serviceId)
    );

    $select.empty();

    if (!filtered.length) {
        $select.append($('<option>').val('').text('Não há profissionais disponíveis'));
        return;
    }

    filtered.forEach(p => {
        $select.append($('<option>').val(p.id).text(p.nome));
    });
}

// #endregion TEAM

// ------------------------------------------------------------------------------------------

// #region APPOINTMENTS

async function confirmAppointment() {
    const payload = {
        cliente: $('#client-name').val().trim(),
        servicoId: $('#select-service').val(),
        profissional: {
            id: $('#select-professional').val(),
            nome: $('#select-professional option:selected').text(),
        },
        data: $('#appointment-datetime').val(),
    };

    if (!payload.cliente || !payload.data) {
        showToast('Please fill in all fields.');
        return;
    }

    try {
        await appointments.create(payload);
        showToast('Appointment confirmed!');
        $('#client-name').val('');
        $('#appointment-datetime').val('');
    } catch {
        showToast('Failed to schedule. Please try again.');
    }
}

function initAppointments() {
    $('#select-service').on('change', filterProfessionalsByService);

    $('#btn-confirm-container').append(
        createButton({
            label: 'Confirme o agendamento',
            variant: 'accent',
            full: true,
            onClick: confirmAppointment,
        })
    );
}

// #endregion APPOINTMENTS

// ------------------------------------------------------------------------------------------

// #region SETTINGS

async function loadConfig() {
    const _config = await config.get();

    localServices = _config.servicos ?? [];
    localProfessionals = _config.profissionais ?? [];

    fillServices();
}

// #endregion SETTINGS

// ------------------------------------------------------------------------------------------

export async function init(cancellationToken) {
    const stop = () => cancellationToken.cancelled;

    await loadConfig();
    if (stop()) return;

    initAppointments();
}