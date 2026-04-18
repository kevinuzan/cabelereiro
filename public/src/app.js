const socket = io();

// Alternar entre visões
function toggleView(view) {
    document.getElementById('view-cliente').classList.toggle('hidden', view !== 'cliente');
    document.getElementById('view-admin').classList.toggle('hidden', view !== 'admin');
    if (view === 'admin') carregarAgendamentosAdmin();
    carregarConfigs();
}

async function carregarConfigs() {
    const res = await fetch('/api/admin/config');
    const config = await res.json();
    
    // Atualiza o select do cliente
    const select = document.getElementById('select-barbeiro');
    select.innerHTML = config.profissionais.map(p => `<option value="${p}">${p}</option>`).join('');
    
    // Preenche inputs do admin
    document.getElementById('tempo-corte').value = config.tempoCorte;
    document.getElementById('lista-profissionais').value = config.profissionais.join(', ');
}

async function salvarConfig() {
    const tempoCorte = document.getElementById('tempo-corte').value;
    const profissionais = document.getElementById('lista-profissionais').value.split(',').map(s => s.trim());

    await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempoCorte, profissionais })
    });
    alert("Configurações salvas!");
    carregarConfigs();
}

async function fazerAgendamento() {
    const dados = {
        cliente: document.getElementById('nome-cliente').value,
        profissional: document.getElementById('select-barbeiro').value,
        data: document.getElementById('data-hora').value
    };

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
    lista.innerHTML = agendamentos.map(a => `
        <li><strong>${a.data}</strong>: ${a.cliente} com ${a.profissional}</li>
    `).join('');
}

// Escuta em tempo real se houver novo agendamento enquanto o admin está aberto
socket.on('novo_agendamento', (data) => {
    alert(`Novo agendamento: ${data.cliente}!`);
    carregarAgendamentosAdmin();
});

// Inicialização
carregarConfigs();