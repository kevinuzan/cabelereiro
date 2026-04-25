// services
import { config } from '../../src/services/config.js';
import { appointments } from '../../src/services/appointments.js';
// components
import { createButton } from '../../src/components/button.js';
import { showToast } from '../../src/components/toast.js';

// #region LOCAL STATE

let localServices = [];
let localProfessionals = [];

// #endregion LOCAL STATE

// ------------------------------------------------------------------------------------------

// #region RENDERS

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

function filterProfessionalsByService() {
    const serviceId = $('#select-service').val();
    const $select = $('#select-professional');

    const filtered = localProfessionals.filter(p =>
        p.servicosIds && p.servicosIds.includes(serviceId)
    );

    $select.empty();

    if (!filtered.length) {
        $select.append($('<option>').val('').text('No professionals available'));
        return;
    }

    filtered.forEach(p => {
        $select.append($('<option>').val(p.id).text(p.nome));
    });
}

// #endregion RENDERS

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

// #endregion APPOINTMENTS

// ------------------------------------------------------------------------------------------

// #region INIT

async function loadConfig() {
    const _config = await config.get();

    localServices = _config.servicos ?? [];
    localProfessionals = _config.profissionais ?? [];

    fillServices();
}

export async function init() {
    await loadConfig();

    $('#select-service').on('change', filterProfessionalsByService);
    
    $('#btn-confirm-container').append(
        createButton({
            label: 'Confirm Appointment',
            variant: 'accent',
            full: true,
            onClick: confirmAppointment,
        })
    );
}

// #endregion INIT