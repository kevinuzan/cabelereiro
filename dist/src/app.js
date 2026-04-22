const socket = io();

// ==========================================
// 1. ESTADO GLOBAL DO APP
// ==========================================
let listaProfissionaisLocal = [];
let fotoBase64 = "";
let listaServicosLocal = [];
let fotoServicoBase64 = "";
let itemSendoEditado = null;
let tipoSendoEditado = ''; // 'prof' ou 'serv'
let fotoEdicaoTemp = "";

// ==========================================
// 2. INICIALIZAÇÃO E NAVEGAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Eventos de Navegação
    document.getElementById('btn-view-cliente')?.addEventListener('click', () => toggleView('cliente'));
    document.getElementById('btn-view-admin')?.addEventListener('click', () => toggleView('admin'));

    // Eventos de Ação
    document.getElementById('btn-salvar')?.addEventListener('click', salvarConfig);
    document.getElementById('btn-agendar')?.addEventListener('click', fazerAgendamento);
    document.getElementById('btn-add-prof')?.addEventListener('click', adicionarProfissionalALista);

    // Listener para Upload de Foto
    document.getElementById('input-foto-prof')?.addEventListener('change', tratarUploadFoto);

    carregarConfigs();
});

window.toggleView = function (view) {
    const isCliente = view === 'cliente';

    document.getElementById('view-cliente')?.classList.toggle('hidden', !isCliente);
    document.getElementById('view-admin')?.classList.toggle('hidden', isCliente);

    document.getElementById('btn-view-cliente')?.classList.toggle('active', isCliente);
    document.getElementById('btn-view-admin')?.classList.toggle('active', !isCliente);

    if (view === 'admin') carregarAgendamentosAdmin();
    carregarConfigs();
};

window.mudarSubTab = function (subview) {
    // Esconde todas as subviews
    document.querySelectorAll('.subview').forEach(el => el.classList.add('hidden'));

    // Remove a classe 'active' de todos os botões de subtab
    document.querySelectorAll('[id^="tab-btn-"]').forEach(btn => btn.classList.remove('active'));

    // Mostra a subview selecionada
    document.getElementById(`subview-${subview}`).classList.remove('hidden');

    // Ativa o botão correspondente
    document.getElementById(`tab-btn-${subview}`).classList.add('active');

    // Se for para a aba de equipe, garante que os checkboxes de serviços estejam atualizados
    if (subview === 'equipe') renderizarCheckboxesServicos();
};

// ==========================================
// 3. BLOCO DE CONFIGURAÇÕES (BANCO DE DADOS)
// ==========================================
async function carregarConfigs() {
    try {
        const res = await fetch('/api/admin/config');
        const config = await res.json();

        // IMPORTANTE: Atualizar as listas locais com o que veio do banco
        listaProfissionaisLocal = config.profissionais || [];
        listaServicosLocal = config.servicos || [];


        // Preenche Select do Cliente
        const select = document.getElementById('select-barbeiro');
        if (select) {
            select.innerHTML = listaProfissionaisLocal.map(p =>
                `<option value="${p.id}">${p.nome}</option>`
            ).join('');
        }

        // Preenche Inputs do Admin
        const tempoCorteInput = document.getElementById('tempo-corte');
        if (tempoCorteInput) tempoCorteInput.value = config.tempoCorte || 30;

        const selectServico = document.getElementById('select-servico');
        if (selectServico) {
            selectServico.innerHTML = config.servicos.map(s =>
                `<option value="${s.id}">${s.nome} - ${s.duracao}min</option>`
            ).join('');
        }
        renderizarListaServicosAdmin();
        renderizarListaProfissionaisAdmin();
        renderizarCheckboxesServicos();
    } catch (err) {
        console.error("Erro ao carregar configs:", err);
    }
}

async function salvarConfig() {
    const tempoCorte = document.getElementById('tempo-corte')?.value || 30;

    const dadosParaEnviar = {
        tempoCorte,
        profissionais: listaProfissionaisLocal, // O array que você montou no Admin
        servicos: listaServicosLocal            // O NOVO array de serviços com fotos
    };

    const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar)
    });

    if (res.ok) {
        alert("Tudo salvo! Profissionais e Serviços atualizados.");
        carregarConfigs();
    }
}

// ==========================================
// 4. BLOCO DE SERVIÇOS
// ==========================================

// Templates de Serviços
const servicosPadrao = {
    corte: { nome: "Corte", duracao: 30, foto: "url_padrao_corte" },
    barba: { nome: "Barba", duracao: 20, foto: "url_padrao_barba" },
    mecha: { nome: "Mecha", duracao: 240, foto: "url_padrao_mecha" },
    manicure: { nome: "Manicure", duracao: 60, foto: "url_padrao_manicure" },
    pedicure: { nome: "Pedicure", duracao: 60, foto: "url_padrao_pedicure" }
};

function selecionarTemplateServico(chave) {
    const template = servicosPadrao[chave];
    if (template) {
        document.getElementById('novo-nome-servico').value = template.nome;
        document.getElementById('nova-duracao-servico').value = template.duracao;
    }
}

// Upload de foto do serviço
document.getElementById('input-foto-servico')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        fotoServicoBase64 = reader.result;
        document.getElementById('preview-foto-servico').innerHTML = `<img src="${fotoServicoBase64}" style="width: 70px; border-radius: 8px;">`;
    };
    if (file) reader.readAsDataURL(file);
});

// Adicionar serviço
document.getElementById('btn-add-servico')?.addEventListener('click', () => {
    const nome = document.getElementById('novo-nome-servico').value;
    const duracao = document.getElementById('nova-duracao-servico').value;

    if (!nome || !fotoServicoBase64) return alert("Preencha o nome e a foto do serviço!");

    listaServicosLocal.push({
        id: Date.now().toString(),
        nome,
        duracao: parseInt(duracao),
        foto: fotoServicoBase64
    });

    // Limpar campos e renderizar
    document.getElementById('novo-nome-servico').value = "";
    fotoServicoBase64 = "";
    document.getElementById('preview-foto-servico').innerHTML = "";
    renderizarListaServicosAdmin();
});

function renderizarListaServicosAdmin() {
    const container = document.getElementById('lista-servicos-cards');
    if (!container) return;
    container.innerHTML = listaServicosLocal.map(s => `
        <div class="prof-admin-card">
            <img src="${s.foto}" style="width: 45px; height: 45px; border-radius: 8px;">
            <span style="flex: 1;">${s.nome} (${s.duracao} min)</span>
            <button onclick="abrirEditarServico('${s.id}')" class="btn-edit">Editar</button>
            <button onclick="removerServico('${s.id}')" class="btn-remove">Excluir</button>
        </div>
    `).join('');
}

window.removerServico = (id) => {
    listaServicosLocal = listaServicosLocal.filter(s => s.id !== id);
    renderizarListaServicosAdmin();
};

function renderizarCheckboxesServicos() {
    const container = document.getElementById('container-checkbox-servicos');
    if (!container) return;

    if (listaServicosLocal.length === 0) {
        container.innerHTML = `<p style="color: var(--text-dim); font-size: 13px;">Cadastre serviços primeiro para atribuir à equipe.</p>`;
        return;
    }

    container.innerHTML = listaServicosLocal.map(serv => `
        <label>
            <input type="checkbox" class="check-servico-prof" value="${serv.id}">
            <span class="service-chip">${serv.nome}</span>
        </label>
    `).join('');
}

// ==========================================
// 5. BLOCO DE EQUIPE (PROFISSIONAIS)
// ==========================================
function tratarUploadFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        fotoBase64 = reader.result;
        const preview = document.getElementById('preview-foto');
        if (preview) {
            preview.innerHTML = `<img src="${fotoBase64}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">`;
        }
    };
    reader.readAsDataURL(file);
}

function adicionarProfissionalALista() {
    const nomeInput = document.getElementById('novo-nome-prof');
    const nome = nomeInput?.value.trim();

    // Captura os IDs dos serviços marcados
    const checkboxes = document.querySelectorAll('.check-servico-prof:checked');
    const servicosIds = Array.from(checkboxes).map(cb => cb.value);

    if (!nome || !fotoBase64) return alert("Preencha nome e foto!");
    if (servicosIds.length === 0) return alert("Selecione pelo menos um serviço que ele faz!");

    listaProfissionaisLocal.push({
        id: Date.now().toString(),
        nome: nome,
        foto: fotoBase64,
        servicosIds: servicosIds // Salvando a atribuição
    });

    // Limpa campos e desmarca tudo
    nomeInput.value = "";
    document.querySelectorAll('.check-servico-prof').forEach(cb => cb.checked = false);
    renderizarListaProfissionaisAdmin();
}

function renderizarListaProfissionaisAdmin() {
    const container = document.getElementById('lista-profissionais-cards');
    if (!container) return;

    container.innerHTML = listaProfissionaisLocal.map(prof => `
        <div class="prof-admin-card" style="display: flex; align-items: center; background: #1a1a1a; padding: 10px; border-radius: 12px; margin-bottom: 10px; gap: 12px; border: 1px solid #282828;">
            <img src="${prof.foto}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">
            <span style="flex: 1; font-weight: 600;">${prof.nome}</span>
            <button onclick="abrirEditarProfissional('${prof.id}')" class="btn-edit">Editar</button>
            <button onclick="removerProfissional('${prof.id}')" class="btn-remove">Excluir</button>
        </div>
    `).join('');
}

window.removerProfissional = function (id) {
    listaProfissionaisLocal = listaProfissionaisLocal.filter(p => p.id !== id);
    renderizarListaProfissionaisAdmin();
};

// ==========================================
// 6. BLOCO DE FILTROS E BUSCAS
// ==========================================
document.getElementById('select-servico')?.addEventListener('change', function () {
    const servicoSelecionadoId = this.value;
    const selectProf = document.getElementById('select-barbeiro');

    // Filtra os profissionais que possuem o ID do serviço selecionado
    const profissionaisFiltrados = listaProfissionaisLocal.filter(p =>
        p.servicosIds && p.servicosIds.includes(servicoSelecionadoId)
    );

    if (selectProf) {
        if (profissionaisFiltrados.length > 0) {
            selectProf.innerHTML = profissionaisFiltrados.map(p =>
                `<option value="${p.id}">${p.nome}</option>`
            ).join('');
        } else {
            selectProf.innerHTML = `<option value="">Nenhum profissional disponível</option>`;
        }
    }
});

// ==========================================
// 7. BLOCO DE MODAL E EDIÇÃO
// ==========================================
window.abrirEditarServico = function (id) {
    const modal = document.getElementById('modal-edicao');
    itemSendoEditado = listaServicosLocal.find(s => s.id === id);
    tipoSendoEditado = 'serv';

    // GARANTIA: Remove o display none e coloca flex para centralizar
    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    document.getElementById('modal-titulo').innerText = "Editar Serviço";
    const campos = document.getElementById('campos-edicao');

    campos.innerHTML = `
        <div class="form-group">
            <label>Nome</label>
            <input type="text" id="edit-nome" value="${itemSendoEditado.nome}">
        </div>
        <div class="form-group">
            <label>Duração (min)</label>
            <input type="number" id="edit-duracao" value="${itemSendoEditado.duracao}">
        </div>
        <div class="form-group">
            <label>Trocar Foto</label>
            <input type="file" id="edit-foto" accept="image/*" onchange="tratarFotoEdicao(this)">
        </div>
    `;

    document.getElementById('modal-edicao').classList.remove('hidden');
};

window.abrirEditarProfissional = function (id) {
    const modal = document.getElementById('modal-edicao');
    itemSendoEditado = listaProfissionaisLocal.find(p => p.id === id);
    tipoSendoEditado = 'prof';

    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    document.getElementById('modal-titulo').innerText = "Editar Profissional";
    const campos = document.getElementById('campos-edicao');

    // Gerando os Chips de serviços dentro do modal
    const chipsServicos = listaServicosLocal.map(s => `
        <label>
            <input type="checkbox" class="edit-check-servico" value="${s.id}" 
            ${itemSendoEditado.servicosIds?.includes(s.id) ? 'checked' : ''}>
            <span class="service-chip">${s.nome}</span>
        </label>
    `).join('');

    campos.innerHTML = `
        <div class="form-group">
            <label>Nome</label>
            <input type="text" id="edit-nome" value="${itemSendoEditado.nome}">
        </div>
        <div class="form-group">
            <label>Serviços Realizados</label>
            <div class="checkbox-grid">${chipsServicos}</div>
        </div>
        <div class="form-group">
            <label>Trocar Foto</label>
            <input type="file" id="edit-foto" accept="image/*" onchange="tratarFotoEdicao(this)">
        </div>
    `;
};

function tratarFotoEdicao(input) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onloadend = () => { fotoEdicaoTemp = reader.result; };
    if (file) reader.readAsDataURL(file);
}

document.getElementById('btn-confirmar-edicao').addEventListener('click', () => {
    const novoNome = document.getElementById('edit-nome').value;

    if (tipoSendoEditado === 'serv') {
        const novaDuracao = document.getElementById('edit-duracao').value;
        itemSendoEditado.nome = novoNome;
        itemSendoEditado.duracao = parseInt(novaDuracao);
        if (fotoEdicaoTemp) itemSendoEditado.foto = fotoEdicaoTemp;
        renderizarListaServicosAdmin();
    } else {
        const checks = document.querySelectorAll('.edit-check-servico:checked');
        itemSendoEditado.nome = novoNome;
        itemSendoEditado.servicosIds = Array.from(checks).map(cb => cb.value);
        if (fotoEdicaoTemp) itemSendoEditado.foto = fotoEdicaoTemp;
        renderizarListaProfissionaisAdmin();
    }

    fecharModal();
    alert("Alteração feita! Não esqueça de clicar em 'SALVAR TUDO' para gravar no banco.");
});

window.fecharModal = () => {
    const modal = document.getElementById('modal-edicao');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    fotoEdicaoTemp = ""; // Limpa a foto temporária da edição
};

// ==========================================
// 8. BLOCO DE AGENDAMENTOS
// ==========================================
async function fazerAgendamento() {
    const dados = {
        cliente: document.getElementById('nome-cliente').value,
        profissionalId: document.getElementById('select-barbeiro').value,
        data: document.getElementById('data-hora').value
    };

    if (!dados.cliente || !dados.data) return alert("Preencha todos os campos!");

    await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    alert("Agendado com sucesso!");
}

async function carregarAgendamentosAdmin() {
    const res = await fetch('/api/agendamentos');
    const agendamentos = await res.json();
    const lista = document.getElementById('lista-admin');
    if (lista) {
        lista.innerHTML = agendamentos.map(a => {
            // Busca o nome do profissional pelo ID para exibir na lista
            const prof = listaProfissionaisLocal.find(p => p.id === a.profissionalId);
            return `<li class="appointment-item"><strong>${a.data}</strong>: ${a.cliente} com ${prof ? prof.nome : 'Profissional'}</li>`;
        }).join('');
    }
}

// ==========================================
// 9. BLOCO REAL-TIME (SOCKET.IO)
// ==========================================
socket.on('novo_agendamento', (data) => {
    alert(`Novo agendamento: ${data.cliente}!`);
    if (!document.getElementById('view-admin').classList.contains('hidden')) {
        carregarAgendamentosAdmin();
    }
});