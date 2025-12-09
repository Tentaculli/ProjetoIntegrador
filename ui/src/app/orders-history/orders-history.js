import { api } from '../../services/api.js';

document.addEventListener("DOMContentLoaded", () => {
    carregarPedidos();
});

// Logout global
window.fazerLogout = function() {
    localStorage.removeItem('currentClient');
    window.location.href = '../login/login.html';
};

// Variável global para armazenar todos os pedidos e estado de ordenação
let todosOsPedidos = [];
let ordenacaoDescendente = true; // true = mais novo primeiro, false = mais antigo primeiro

async function carregarPedidos() {
    const container = document.getElementById("lista-pedidos");
    
    // Verificar login
    const clientData = localStorage.getItem('currentClient');
    if (!clientData) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px; color: #777;">
                Você precisa estar logado para ver suas encomendas.
                <br><br>
                <a href="../login/login.html" style="color: #6f42c1; text-decoration: none; font-weight: 600;">Clique aqui para fazer login</a>
            </div>
        `;
        return;
    }

    const client = JSON.parse(clientData);

    try {
        // Buscar pedidos do cliente
        const pedidos = await api.getOrdersByClientId(client.id);
        
        // Buscar TODOS os pedidos para calcular posição na fila
        const todosPedidos = await api.getAllOrders();
        
        // Filtrar apenas pedidos "Aguardando" e ordenar por data de criação
        const pedidosAguardando = todosPedidos
            .filter(p => {
                const status = p.status;
                return status === 1 || status === "Waiting" || status === "waiting";
            })
            .sort((a, b) => new Date(a.created) - new Date(b.created));
        
        // Adicionar posição na fila a cada pedido do cliente
        const pedidosComFila = pedidos.map(pedido => {
            const status = pedido.status;
            const estaAguardando = status === 1 || status === "Waiting" || status === "waiting";
            
            if (estaAguardando) {
                // Encontrar posição deste pedido na fila
                const posicao = pedidosAguardando.findIndex(p => p.id === pedido.id) + 1;
                return { ...pedido, posicaoFila: posicao };
            }
            
            return { ...pedido, posicaoFila: null };
        });
        
        container.innerHTML = "";
        
        if (!pedidosComFila || pedidosComFila.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 40px; color: #777;">
                    Você ainda não fez nenhuma encomenda.
                </div>
            `;
            return;
        }

        // Armazenar globalmente
        todosOsPedidos = pedidosComFila;

        // Exibir com ordenação padrão
        exibirPedidos(todosOsPedidos);
        
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        container.innerHTML = `
            <div style="text-align:center; padding: 40px; color: #ff4d4d;">
                Erro ao carregar pedidos. Tente novamente mais tarde.
            </div>
        `;
    }
}

// Função para exibir pedidos
function exibirPedidos(pedidos) {
    const container = document.getElementById("lista-pedidos");
    container.innerHTML = "";

    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px; color: #777;">
                Nenhum pedido encontrado com os filtros aplicados.
            </div>
        `;
        return;
    }

    // Aplicar ordenação por data
    const pedidosOrdenados = ordenarPorData(pedidos);

    pedidosOrdenados.forEach(pedido => {
        const cardHTML = criarCardHTML(pedido);
        container.innerHTML += cardHTML;
    });
}

// Função de ordenação por data E status
function ordenarPorData(pedidos) {
    const pedidosCopia = [...pedidos];
    
    return pedidosCopia.sort((a, b) => {
        // 1. Normalizar status para números
        const normalizarStatus = (status) => {
            if (status === 2 || status === "InProgress" || status === "inprogress") return 2; // Em Produção
            if (status === 1 || status === "Waiting" || status === "waiting") return 1; // Aguardando
            if (status === 3 || status === "Finished" || status === "finished") return 3; // Entregue
            if (status === 4 || status === "Canceled" || status === "canceled") return 4; // Cancelado
            return 5; // Outros
        };

        const statusA = normalizarStatus(a.status);
        const statusB = normalizarStatus(b.status);

        // 2. Definir prioridade dos status (menor = mais importante)
        const prioridadeStatus = {
            2: 1, // Em Produção (maior prioridade)
            1: 2, // Aguardando
            3: 3, // Entregue
            4: 4, // Cancelado
            5: 5  // Outros
        };

        const prioridadeA = prioridadeStatus[statusA] || 5;
        const prioridadeB = prioridadeStatus[statusB] || 5;

        // 3. Primeiro compara por prioridade de status
        if (prioridadeA !== prioridadeB) {
            return prioridadeA - prioridadeB;
        }

        // 4. Se status for igual, ordena por data
        const dataA = new Date(a.created);
        const dataB = new Date(b.created);

        // Se descendente: mais novo primeiro
        // Se ascendente: mais antigo primeiro
        return ordenacaoDescendente 
            ? dataB - dataA  // Mais recente primeiro
            : dataA - dataB; // Mais antigo primeiro
    });
}

// Função para alternar ordenação (toggle)
window.toggleOrdenacao = function() {
    ordenacaoDescendente = !ordenacaoDescendente;
    
    const btn = document.getElementById('btn-sort');
    if (ordenacaoDescendente) {
        btn.classList.add('desc');
        btn.title = 'Ordenar por data (Mais Recente)';
    } else {
        btn.classList.remove('desc');
        btn.title = 'Ordenar por data (Mais Antigo)';
    }
    
    aplicarFiltros();
};

// Função para aplicar filtros
window.aplicarFiltros = function() {
    const statusFiltro = document.getElementById('filter-status').value;

    let pedidosFiltrados = [...todosOsPedidos];

    // Aplicar filtro de status
    if (statusFiltro !== 'todos') {
        const statusNumerico = parseInt(statusFiltro);
        pedidosFiltrados = pedidosFiltrados.filter(pedido => {
            const normalizarStatus = (status) => {
                if (status === 2 || status === "InProgress" || status === "inprogress") return 2;
                if (status === 1 || status === "Waiting" || status === "waiting") return 1;
                if (status === 3 || status === "Finished" || status === "finished") return 3;
                if (status === 4 || status === "Canceled" || status === "canceled") return 4;
                return 5;
            };
            return normalizarStatus(pedido.status) === statusNumerico;
        });
    }

    // Exibir resultados (já aplica a ordenação atual)
    exibirPedidos(pedidosFiltrados);
};

// Função para resetar filtros
window.resetarFiltros = function() {
    document.getElementById('filter-status').value = 'todos';
    document.getElementById('sort-order').value = 'prioridade';
    exibirPedidos(todosOsPedidos);
};

function criarCardHTML(pedido) {
    let statusLabel, statusClass;

    // 1. Mapear Status
    const status = pedido.status;
    
    if (status === 1 || status === "Waiting" || status === "waiting") {
        statusLabel = "Aguardando"; 
        statusClass = "aguardando"; // ✅ Mudança aqui
    } else if (status === 2 || status === "InProgress" || status === "inprogress") {
        statusLabel = "Em Produção"; 
        statusClass = "produzindo"; // ✅ Mantém azul
    } else if (status === 3 || status === "Finished" || status === "finished") {
        statusLabel = "Entregue"; 
        statusClass = "entregue";
    } else if (status === 4 || status === "Canceled" || status === "canceled") {
        statusLabel = "Cancelado"; 
        statusClass = "cancelado";
    } else {
        statusLabel = "Em Trânsito"; 
        statusClass = "entregando";
    }

    // 2. Mapear Formas
    const mapearShape = (shape) => {
        if (typeof shape === 'number') return shape;
        const s = String(shape).toLowerCase();
        if (s === "hexagon") return 3;
        if (s === "square") return 2;
        if (s === "circle") return 1;
        return 0;
    };

    const config = [
        mapearShape(pedido.pin1Pos1), mapearShape(pedido.pin1Pos2), mapearShape(pedido.pin1Pos3),
        mapearShape(pedido.pin2Pos1), mapearShape(pedido.pin2Pos2), mapearShape(pedido.pin2Pos3)
    ];

    const htmlPino1 = config.slice(0, 3).map(tipo => 
        tipo === 0 ? `<div class="mini-peca vazio"></div>` : `<div class="mini-peca tipo-${tipo}"></div>`
    ).join('');

    const htmlPino2 = config.slice(3, 6).map(tipo => 
        tipo === 0 ? `<div class="mini-peca vazio"></div>` : `<div class="mini-peca tipo-${tipo}"></div>`
    ).join('');

    // 3. Formatar Data
    const dataObj = new Date(pedido.created);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');

    // 4. Verificar se pode cancelar
    const podeCancel = (status === 1 || status === "Waiting" || status === "waiting");

    // 5. Mostrar posição na fila (minimalista)
    const infoFila = pedido.posicaoFila !== null && pedido.posicaoFila > 0
        ? `<span class="queue-position">${pedido.posicaoFila}º na fila</span>`
        : '';

    // 6. Botão de cancelar com slide reveal
    const btnCancel = podeCancel 
        ? `
        <div class="cancel-zone">
            <button class="btn-cancel-slide" onclick="mostrarConfirmacaoCancelamento(${pedido.id})" title="Cancelar Pedido">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </div>
        ` 
        : '';

    // 7. Retornar HTML Estruturado
    return `
        <div class="order-card-wrapper">
            <div class="order-card ${podeCancel ? 'cancelavel' : ''}">
                <div class="order-left">
                    <div class="order-header-line">
                        <h3>Pedido #${pedido.id}</h3>
                        <span class="date-badge">${dataFormatada}</span>
                        ${infoFila}
                    </div>

                    <div class="visual-config">
                        ${htmlPino1}
                        <div class="pino-divisor"></div>
                        ${htmlPino2}
                    </div>
                </div>

                <div class="status-badge ${statusClass}">
                    ${statusLabel}
                </div>
            </div>
            ${btnCancel}
        </div>
    `;
}

// ============================================================================
// MODAL DE CONFIRMAÇÃO DE CANCELAMENTO
// ============================================================================
window.mostrarConfirmacaoCancelamento = function(orderId) {
    const modal = document.getElementById("modal-container-dark");
    
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }

    modal.innerHTML = '';

    const modalBox = document.createElement('div');
    modalBox.className = 'modal-box-dark';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header-dark';

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'modal-icon-wrapper-dark';

    const iconBg = document.createElement('div');
    iconBg.className = 'modal-icon-bg-dark warning';
    
    iconBg.innerHTML = `
        <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25"/>
            <path d="M26 14 L26 28 M26 34 L26 35"/>
        </svg>
    `;

    iconWrapper.appendChild(iconBg);
    modalHeader.appendChild(iconWrapper);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body-dark';

    const h2 = document.createElement('h2');
    h2.textContent = 'Confirmar Cancelamento';
    h2.classList.add('warning-title');

    const p = document.createElement('p');
    p.innerHTML = `Tem certeza que deseja cancelar o <strong>Pedido #${orderId}</strong>?<br><br>Esta ação não poderá ser desfeita.`;

    const btnContainer = document.createElement('div');
    btnContainer.className = 'modal-buttons-row';

    const btnNao = document.createElement('button');
    btnNao.textContent = 'Não, Manter';
    btnNao.className = 'btn-secondary-modal';
    btnNao.onclick = fecharModalDark;

    const btnSim = document.createElement('button');
    btnSim.textContent = 'Sim, Cancelar';
    btnSim.className = 'btn-danger-modal';
    btnSim.onclick = () => confirmarCancelamentoPedido(orderId);

    btnContainer.appendChild(btnNao);
    btnContainer.appendChild(btnSim);

    modalBody.appendChild(h2);
    modalBody.appendChild(p);
    modalBody.appendChild(btnContainer);

    modalBox.appendChild(modalHeader);
    modalBox.appendChild(modalBody);
    modal.appendChild(modalBox);

    modal.classList.remove("fechado");
};

async function confirmarCancelamentoPedido(orderId) {
    try {
        mostrarModalDark('⏳ Verificando status do pedido...', 'loading');

        const response = await fetch(`http://localhost:5150/api/Order/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Não foi possível verificar o status do pedido.');
        }

        const pedidoAtual = await response.json();

        if (pedidoAtual.status !== 1 && pedidoAtual.status !== "Waiting") {
            mostrarModalDark(
                '⚠️ Este pedido não pode mais ser cancelado.<br>O status foi alterado para: <strong>' + 
                mapearStatusParaTexto(pedidoAtual.status) + '</strong>',
                'warning'
            );
            return;
        }

        mostrarModalDark('⏳ Cancelando pedido...', 'loading');
        
        const cancelResponse = await fetch(`http://localhost:5150/api/Order/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(4)
        });

        if (!cancelResponse.ok) {
            const errorData = await cancelResponse.json();
            throw new Error(errorData.Message || errorData.message || 'Falha ao cancelar o pedido.');
        }

        mostrarModalDark(`✅ Pedido #${orderId} cancelado com sucesso!`, 'sucesso');
        
        setTimeout(() => {
            fecharModalDark();
            carregarPedidos();
        }, 2000);

    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        mostrarModalDark(
            `❌ Erro ao cancelar pedido:<br>${error.message}`,
            'erro'
        );
    }
};

// ============================================================================
// FUNÇÃO DE CANCELAMENTO COM VALIDAÇÃO
// ============================================================================
window.cancelarPedido = async function(orderId) {
    try {
        // 1. Mostrar modal de confirmação PRIMEIRO
        mostrarModalConfirmacao(orderId);
    } catch (error) {
        console.error('Erro ao preparar cancelamento:', error);
        mostrarModalDark(
            `❌ Erro inesperado:<br>${error.message}`,
            'erro'
        );
    }
};
