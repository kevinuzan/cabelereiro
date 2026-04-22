// services
import { config } from '../../src/services/config.js';
import { appointments } from '../../src/services/appointments.js';
// components
import { createButton } from '../../src/components/button.js';
import { showToast } from '../../src/components/toast.js';

async function fillProfessionals() {
    const _config = await config.get();

    const select = document.getElementById('select-professional');

    select.innerHTML = '';
    _config.profissionais.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.nome;
        select.appendChild(option);
    });
}

async function confirmAppointment() {
    const select = document.getElementById('select-professional');
    const selected = select.options[select.selectedIndex];

    const payload = {
        cliente: document.getElementById('client-name').value.trim(),
        profissional: { id: select.value, nome: selected.textContent },
        data: document.getElementById('appointment-datetime').value,
    };

    if (!payload.cliente || !payload.data) {
        showToast('Please fill in all fields.');
        return;
    }

    try {
        await appointments.create(payload);
        showToast('Appointment confirmed!');
        document.getElementById('client-name').value = '';
        document.getElementById('appointment-datetime').value = '';
    } catch {
        showToast('Failed to schedule. Please try again.');
    }
}

function mountButton() {
    const container = document.getElementById('btn-confirm-container');
    container.appendChild(
        createButton({
            label: 'Confirm Appointment',
            variant: 'accent',
            full: true,
            onClick: confirmAppointment,
        })
    );
}

export async function init() {
    await fillProfessionals();
    mountButton();
}
