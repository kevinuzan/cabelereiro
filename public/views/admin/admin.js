// services
import { appointments } from '../../src/services/appointments.js';
import { config } from '../../src/services/config.js';
import { socket } from '../../src/services/socket.js';
// components
import { createButton } from '../../src/components/button.js';
import { showToast } from '../../src/components/toast.js';
import { renderAppointmentList } from '../../src/components/appointments.js';
// utils
import { readFileAsBase64 } from '../../utils/file.js';

let localProfessionals = [];
let localServices = [];
let servicePhotoBase64 = '';
let profPhotoBase64 = '';

let editingItem = null;
let editingPhotoTemp = '';

// ------------------------------------------------------------------------------------------

// #region HELPERS

/**
 * Builds a .field wrapper with a label and an input element.
 */
function buildField(label, $input) {
    return $('<div>')
        .addClass('field')
        .append(
            $('<label>').addClass('field__label').text(label),
            $input,
        );
}

// #endregion HELPERS

// ------------------------------------------------------------------------------------------

// #region MODAL

function openModal() {
    $('#edit-modal').removeClass('hidden');
}

function closeModal() {
    $('#edit-modal').addClass('hidden');
    editingPhotoTemp = '';
}

function initModalButtons(onConfirm) {
    $('#btn-modal-confirm-container').empty().append(
        createButton({
            label: 'Confirmar',
            variant: 'accent',
            full: true,
            onClick: onConfirm,
        })
    );
    $('#btn-modal-cancel-container').empty().append(
        createButton({
            label: 'Cancelar',
            variant: 'ghost',
            full: true,
            onClick: closeModal,
        })
    );
    $('#modal-backdrop').off('click').on('click', closeModal);
}

// #endregion MODAL

// ------------------------------------------------------------------------------------------

// #region SETTINGS

function loadSettings() {
    return config.get().then((_config) => {
        localProfessionals = _config.profissionais ?? [];
        localServices = _config.servicos ?? [];
        $('#cut-duration').val(_config.tempoCorte ?? 30);
    });
}

function saveSettings() {
    return config
        .save($('#cut-duration').val(), localProfessionals, localServices)
        .then(() => showToast('Settings saved!'))
        .catch(() => showToast('Failed to save settings.'));
}

function initSettings() {
    $('#btn-save-container').append(
        createButton({
            label: 'Salvar configurações',
            variant: 'primary',
            full: true,
            onClick: saveSettings,
        })
    );
}

// #endregion SETTINGS

// ------------------------------------------------------------------------------------------

// #region SERVICES

function renderServicesList() {
    const $container = $('#services-list');
    if (!$container.length) return;
    $container.empty();

    localServices.forEach(s => {
        $container.append(
            $('<div>')
                .addClass('admin-item')
                .append(
                    $('<img>').addClass('admin-item__photo').attr('src', s.foto),
                    $('<span>').addClass('admin-item__name').text(`${s.nome} (${s.duracao} min)`),
                    createButton({ label: 'Editar', variant: 'ghost', onClick: () => openEditService(s.id) }),
                    createButton({ label: 'Remover', variant: 'danger', onClick: () => removeService(s.id) }),
                )
        );
    });
}

function initServicePhotoUpload() {
    $('#service-photo').on('change', function () {
        readFileAsBase64(this.files[0], (base64) => {
            servicePhotoBase64 = base64;
            $('#service-photo-preview')
                .empty()
                .append($('<img>')
                    .attr('src', base64)
                    .css({ width: '70px', borderRadius: '8px', marginTop: '8px' })
                );
        });
    });
}

function addService() {
    const name = $('#service-name').val().trim();
    const duration = $('#service-duration').val();

    if (!name || !servicePhotoBase64) {
        showToast('Please fill in the name and upload a photo.');
        return;
    }

    localServices.push({
        id: crypto.randomUUID(),
        nome: name,
        duracao: parseInt(duration),
        foto: servicePhotoBase64,
    });

    $('#service-name').val('');
    $('#service-duration').val('30');
    $('#service-photo-preview').empty();
    servicePhotoBase64 = '';

    renderServicesList();
}

function removeService(id) {
    localServices = localServices.filter(s => s.id !== id);
    renderServicesList();
}

function openEditService(id) {
    editingItem = localServices.find(s => s.id === id);
    editingPhotoTemp = '';

    $('#modal-title').text('Editar Serviço');
    $('#modal-fields').empty().append(
        buildField('Nome', $('<input>')
            .addClass('field__input')
            .attr({ type: 'text', id: 'edit-name' })
            .val(editingItem.nome)
        ),
        buildField('Duração (min)', $('<input>')
            .addClass('field__input')
            .attr({ type: 'number', id: 'edit-duration' })
            .val(editingItem.duracao)
        ),
        buildField('Foto', $('<input>')
            .addClass('field__input')
            .attr({ type: 'file', id: 'edit-photo', accept: 'image/*' })
        ),
    );

    $('#edit-photo').on('change', function () {
        readFileAsBase64(this.files[0], (base64) => { editingPhotoTemp = base64; });
    });

    initModalButtons(confirmEditService);
    openModal();
}

function confirmEditService() {
    editingItem.nome = $('#edit-name').val().trim();
    editingItem.duracao = parseInt($('#edit-duration').val());
    if (editingPhotoTemp) editingItem.foto = editingPhotoTemp;

    renderServicesList();
    closeModal();
    showToast("Changes applied. Don't forget to save.");
}

function initServices() {
    renderServicesList();
    initServicePhotoUpload();
    $('#btn-add-service-container').append(
        createButton({
            label: 'Adicionar Serviço',
            variant: 'accent',
            full: true,
            onClick: addService,
        })
    );
}

// #endregion SERVICES

// ------------------------------------------------------------------------------------------

// #region TEAM

function renderServiceCheckboxes() {
    const $container = $('#professional-services-checkboxes');

    if (!$container.length) return;
    $container.empty().addClass('checkbox-grid');

    if (!localServices.length) {
        $container.append(
            $('<p>').text('Add services first.').css('color', 'var(--text-muted)')
        );
        return;
    }

    localServices.forEach(s => {
        $container.append(
            $('<label>')
                .addClass('checkbox-label')
                .append(
                    $('<input>').attr({ type: 'checkbox', value: s.id }).addClass('check-service'),
                    $('<span>').addClass('service-chip').text(s.nome),
                )
        );
    });
}

function renderProfessionalsList() {
    const $container = $('#professionals-list');
    if (!$container.length) return;
    $container.empty();

    localProfessionals.forEach(p => {
        $container.append(
            $('<div>')
                .addClass('admin-item')
                .append(
                    $('<img>')
                        .addClass('admin-item__photo admin-item__photo--round')
                        .attr('src', p.foto),
                    $('<span>')
                        .addClass('admin-item__name')
                        .text(p.nome),
                    createButton({
                        label: 'Editar',
                        variant: 'ghost',
                        onClick: () => openEditProfessional(p.id),
                    }),
                    createButton({
                        label: 'Remover',
                        variant: 'danger',
                        onClick: () => removeProfessional(p.id),
                    }),
                )
        );
    });
}

function initProfessionalPhotoUpload() {
    $('#professional-photo').on('change', function () {
        readFileAsBase64(this.files[0], (base64) => {
            profPhotoBase64 = base64;
            $('#professional-photo-preview')
                .empty()
                .append($('<img>')
                    .attr('src', base64)
                    .css({
                        width: '70px',
                        borderRadius: '50%',
                        marginTop: '8px',
                    })
                );
        });
    });
}

function addProfessional() {
    const name = $('#professional-name').val().trim();
    const serviceIds = $('.check-service:checked').map(
        function () {
            return this.value;
        }).get();

    if (!name) { showToast('Please enter a name.'); return; }
    if (!profPhotoBase64) { showToast('Please upload a photo.'); return; }
    if (!serviceIds.length) { showToast('Select at least one service.'); return; }

    localProfessionals.push({
        id: crypto.randomUUID(),
        nome: name,
        foto: profPhotoBase64,
        servicosIds: serviceIds,
    });

    $('#professional-name').val('');
    $('#professional-photo-preview').empty();
    $('.check-service').prop('checked', false);
    profPhotoBase64 = '';

    renderProfessionalsList();
}

function removeProfessional(id) {
    localProfessionals = localProfessionals.filter(p => p.id !== id);
    renderProfessionalsList();
}

function openEditProfessional(id) {
    editingItem = localProfessionals.find(p => p.id === id);
    editingPhotoTemp = '';

    const $checkboxes = $('<div>').addClass('checkbox-grid');
    localServices.forEach(s => {
        $checkboxes.append(
            $('<label>')
                .addClass('checkbox-label')
                .append(
                    $('<input>')
                        .attr({ type: 'checkbox', value: s.id })
                        .addClass('edit-check-service')
                        .prop('checked', editingItem.servicosIds?.includes(s.id) ?? false),
                    $('<span>').addClass('service-chip').text(s.nome),
                )
        );
    });

    $('#modal-title').text('Editar Profissional');
    $('#modal-fields').empty().append(
        buildField('Nome', $('<input>')
            .addClass('field__input')
            .attr({ type: 'text', id: 'edit-name' })
            .val(editingItem.nome)
        ),
        buildField('Serviços', $checkboxes),
        buildField('Foto', $('<input>')
            .addClass('field__input')
            .attr({ type: 'file', id: 'edit-photo', accept: 'image/*' })
        ),
    );

    $('#edit-photo').on('change', function () {
        readFileAsBase64(this.files[0], (base64) => { editingPhotoTemp = base64; });
    });

    initModalButtons(confirmEditProfessional);
    openModal();
}

function confirmEditProfessional() {
    editingItem.nome = $('#edit-name').val().trim();
    editingItem.servicosIds = $('.edit-check-service:checked').map(
        function () {
            return this.value;
        }).get();
    if (editingPhotoTemp) editingItem.foto = editingPhotoTemp;

    renderProfessionalsList();
    closeModal();
    showToast("Changes applied. Don't forget to save.");
}

function initTeam() {
    renderProfessionalsList();
    renderServiceCheckboxes();
    initProfessionalPhotoUpload();
    $('#btn-add-professional-container').append(
        createButton({
            label: 'Adicionar Profissional',
            variant: 'accent',
            full: true,
            onClick: addProfessional,
        })
    );
}

// #endregion TEAM

// ------------------------------------------------------------------------------------------

// #region APPOINTMENTS

function loadAppointments() {
    return appointments.getAll().then((_appointments) => {
        renderAppointmentList($('#appointments-list')[0], _appointments);
    });
}

// #endregion APPOINTMENTS

// ------------------------------------------------------------------------------------------

// #region TABS

function initSubTabs() {
    $('.btn--sub-tab').on('click', function () {
        const subtab = $(this).data('subtab');

        $('.subview').addClass('hidden');
        $('.btn--sub-tab').removeClass('active');
        $(this).addClass('active');
        $(`#subview-${subtab}`).removeClass('hidden');
    });
}

// #endregion TABS

// ------------------------------------------------------------------------------------------

// #region SOCKET

function onNewAppointment(data) {
    if (!$('#appointments-list').length) return;
    showToast(`New appointment: ${data.cliente}`);
    loadAppointments();
}

socket.on('novo_agendamento', onNewAppointment);

export function cleanup() {
    socket.off('novo_agendamento', onNewAppointment);
}

// #endregion SOCKET

// ------------------------------------------------------------------------------------------

export function init(cancellationToken) {
    const stop = () => cancellationToken.cancelled;

    loadSettings();
    if (stop()) return;

    loadAppointments();
    if (stop()) return;

    initSubTabs();
    initSettings();
    initServices();
    initTeam();
}