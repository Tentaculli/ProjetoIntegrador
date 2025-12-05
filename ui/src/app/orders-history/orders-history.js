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
        const pedidos = await api.getOrdersByClientId(client.id);
        
        container.innerHTML = "";
        
        if (!pedidos || pedidos.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 40px; color: #777;">
                    Você ainda não fez nenhuma encomenda.
                </div>
            `;
            return;
        }

        // Armazenar globalmente
        todosOsPedidos = pedidos;

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

// Função de ordenação por data
function ordenarPorData(pedidos) {
    const pedidosCopia = [...pedidos];
    
    return pedidosCopia.sort((a, b) => {
        const dataA = new Date(a.created);
        const dataB = new Date(b.created);
        
        // Se descendente (padrão): mais novo primeiro
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
    
    // Suporte para resposta string ou int da API
    if (status === 1 || status === "Waiting" || status === "waiting") {
        statusLabel = "Aguardando"; statusClass = "produzindo";
    } else if (status === 2 || status === "InProgress" || status === "inprogress") {
        statusLabel = "Em Produção"; statusClass = "produzindo";
    } else if (status === 3 || status === "Finished" || status === "finished") {
        statusLabel = "Entregue"; statusClass = "entregue";
    } else if (status === 4 || status === "Canceled" || status === "canceled") {
        statusLabel = "Cancelado"; statusClass = "cancelado";
    } else {
        // Fallback visual
        statusLabel = "Em Trânsito"; statusClass = "entregando";
    }

    // 2. Mapear Formas
    const mapearShape = (shape) => {
        if (typeof shape === 'number') return shape;
        const s = String(shape).toLowerCase();
        if (s === "hexagon") return 3;
        if (s === "square") return 2;
        if (s === "circle") return 1;
        return 0; // None/Vazio
    };

    const config = [
        mapearShape(pedido.pin1Pos1), mapearShape(pedido.pin1Pos2), mapearShape(pedido.pin1Pos3),
        mapearShape(pedido.pin2Pos1), mapearShape(pedido.pin2Pos2), mapearShape(pedido.pin2Pos3)
    ];

    // Pino 1 (Indices 0, 1, 2)
    const htmlPino1 = config.slice(0, 3).map(tipo => 
        tipo === 0 ? `<div class="mini-peca vazio"></div>` : `<div class="mini-peca tipo-${tipo}"></div>`
    ).join('');

    // Pino 2 (Indices 3, 4, 5)
    const htmlPino2 = config.slice(3, 6).map(tipo => 
        tipo === 0 ? `<div class="mini-peca vazio"></div>` : `<div class="mini-peca tipo-${tipo}"></div>`
    ).join('');

    // 3. Formatar Data
    const dataObj = new Date(pedido.created);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');

    // 4. Verificar se pode cancelar (apenas status Waiting)
    const podeCancel = (status === 1 || status === "Waiting" || status === "waiting");
    const btnCancel = podeCancel 
        ? `<button class="btn-cancel-order" onclick="cancelarPedido(${pedido.id})">Cancelar Pedido</button>` 
        : '';

    // 5. Retornar HTML Estruturado
    return `
        <div class="order-card">
            <div class="order-left">
                <div class="order-header-line">
                    <h3>Pedido #${pedido.id}</h3>
                    <span class="date-badge">${dataFormatada}</span>
                </div>

                <div class="visual-config">
                    ${htmlPino1}
                    <div class="pino-divisor"></div>
                    ${htmlPino2}
                </div>

                ${btnCancel}
            </div>

            <div class="status-badge ${statusClass}">
                ${statusLabel}
            </div>
        </div>
    `;
}

// ============================================================================
// FUNÇÃO DE CANCELAMENTO COM VALIDAÇÃO
// ============================================================================
window.cancelarPedido = async function(orderId) {
    try {
        // 1. Mostrar modal de loading
        mostrarModalDark('⏳ Verificando status do pedido...', 'loading');

        // 2. Buscar o pedido atualizado antes de cancelar
        const response = await fetch(`http://localhost:5150/api/Order/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Não foi possível verificar o status do pedido.');
        }

        const pedidoAtual = await response.json();

        // 3. Verificar se ainda está em "Waiting"
        if (pedidoAtual.status !== 1 && pedidoAtual.status !== "Waiting") {
            mostrarModalDark(
                '⚠️ Este pedido não pode mais ser cancelado.<br>O status foi alterado para: <strong>' + 
                mapearStatusParaTexto(pedidoAtual.status) + '</strong>',
                'warning'
            );
            return;
        }

        // 4. Se ainda está Waiting, pode cancelar
        mostrarModalDark('⏳ Cancelando pedido...', 'loading');

        const cancelResponse = await fetch(`http://localhost:5150/api/Order/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(4) // 4 = Canceled
        });

        if (!cancelResponse.ok) {
            const errorData = await cancelResponse.json();
            throw new Error(errorData.Message || errorData.message || 'Falha ao cancelar o pedido.');
        }

        // 5. Sucesso - atualizar a página
        mostrarModalDark(`✅ Pedido #${orderId} cancelado com sucesso!`, 'sucesso');
        
        // Recarregar a lista após 2 segundos
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

// Função auxiliar para mapear status para texto legível
function mapearStatusParaTexto(status) {
    if (status === 1 || status === "Waiting") return "Aguardando";
    if (status === 2 || status === "InProgress") return "Em Produção";
    if (status === 3 || status === "Finished") return "Entregue";
    if (status === 4 || status === "Canceled") return "Cancelado";
    return "Desconhecido";
}   

// ============================================================================
// SISTEMA DE MODAL DARK
// ============================================================================
function mostrarModalDark(mensagem, tipo = "sucesso") {
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
    iconBg.className = 'modal-icon-bg-dark';

    let iconSVG = '';
    let titulo = '';
    let btnClass = '';
    let btnText = 'Continuar';
    let mostrarBotao = true;

    if (tipo === "erro") {
        iconBg.classList.add('error');
        iconSVG = `
            <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25"/>
                <path d="M16 16 L36 36 M36 16 L16 36"/>
            </svg>
        `;
        titulo = 'Ops! Algo deu errado';
        btnClass = 'btn-erro';
        btnText = 'Entendi';
    } else if (tipo === "loading") {
        iconBg.classList.add('loading');
        iconSVG = `
            <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="20"/>
            </svg>
        `;
        titulo = 'Processando...';
        mostrarBotao = false; // NÃO MOSTRAR BOTÃO NO LOADING
    } else if (tipo === "warning") {
        iconBg.classList.add('warning');
        iconSVG = `
            <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25"/>
                <path d="M26 14 L26 28 M26 34 L26 35"/>
            </svg>
        `;
        titulo = 'Atenção!';
        btnClass = '';
        btnText = 'OK';
    } else {
        iconBg.classList.add('success');
        iconSVG = `
            <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25"/>
                <path d="M14 27 L22 35 L38 17"/>
            </svg>
        `;
        titulo = 'Tudo certo!';
        btnClass = 'btn-success';
        btnText = 'Continuar';
    }

    iconBg.innerHTML = iconSVG;
    iconWrapper.appendChild(iconBg);
    modalHeader.appendChild(iconWrapper);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body-dark';

    const h2 = document.createElement('h2');
    h2.textContent = titulo;
    if (tipo === "erro") h2.classList.add('error-title');
    else if (tipo === "sucesso") h2.classList.add('success-title');
    else if (tipo === "warning") h2.classList.add('warning-title');
    else if (tipo === "loading") h2.classList.add('loading-title');

    const p = document.createElement('p');
    p.innerHTML = mensagem;

    modalBody.appendChild(h2);
    modalBody.appendChild(p);

    // Só adicionar botão se não for loading
    if (mostrarBotao) {
        const btn = document.createElement('button');
        btn.textContent = btnText;
        btn.className = btnClass;
        btn.onclick = fecharModalDark;
        modalBody.appendChild(btn);
    }

    modalBox.appendChild(modalHeader);
    modalBox.appendChild(modalBody);
    modal.appendChild(modalBox);

    modal.classList.remove("fechado");
}

function fecharModalDark() {
    const modal = document.getElementById("modal-container-dark");
    if (modal) modal.classList.add("fechado");
}

window.fecharModalDark = fecharModalDark;