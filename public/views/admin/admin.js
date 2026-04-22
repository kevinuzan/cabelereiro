// services
import { appointments } from '../../src/services/appointments.js';
import { config } from '../../src/services/config.js';
import { socket } from '../../src/services/socket.js';
// components
import { createButton } from '../../src/components/button.js';
import { showToast } from '../../src/components/toast.js';
import { renderAppointmentList } from '../../src/components/appointments.js';
// utils
import { parseList } from '../../utils/string.js';

async function loadSettings() {
    const _config = await config.get();
    document.getElementById('cut-duration').value = _config.tempoCorte;
    document.getElementById('professionals-list').value = (_config.profissionais ?? []).join(', ');
}

async function loadAppointments() {
    const element = document.getElementById('appointments-list');
    const _appointments = await appointments.getAll();
    renderAppointmentList(element, _appointments);
}

async function saveSettings() {
    const duration = document.getElementById('cut-duration').value;
    const professionals = document.getElementById('professionals-list').value;

    try {
        await config.save(duration, parseList(professionals, {
            transform: nome => ({ id: crypto.randomUUID(), nome })
        }));
        showToast('Settings saved!');
    } catch {
        showToast('Failed to save settings.');
    }
}

function mountButton() {
    const container = document.getElementById('btn-save-container');
    container.appendChild(
        createButton({
            label: 'Save Settings',
            variant: 'primary',
            full: true,
            onClick: saveSettings,
        })
    );
}

function listenToSocket() {
    socket.on('novo_agendamento', (data) => {
        showToast(`New appointment: ${data.cliente}`);
        loadAppointments();
    });
}

listenToSocket();

export async function init() {
    await loadSettings();
    await loadAppointments();
    mountButton();
}
