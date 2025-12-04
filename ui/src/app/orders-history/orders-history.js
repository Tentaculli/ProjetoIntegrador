import { api } from '../../services/api.js';

document.addEventListener("DOMContentLoaded", () => {
    carregarPedidos();
});

// Logout global
window.fazerLogout = function() {
    localStorage.removeItem('currentClient');
    window.location.href = '../login/login.html';
};

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

        // Ordenar: mais recentes primeiro
        pedidos.sort((a, b) => new Date(b.created) - new Date(a.created));

        pedidos.forEach(pedido => {
            const cardHTML = criarCardHTML(pedido);
            container.innerHTML += cardHTML;
        });
        
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        container.innerHTML = `
            <div style="text-align:center; padding: 40px; color: #ff4d4d;">
                Erro ao carregar pedidos. Tente novamente mais tarde.
            </div>
        `;
    }
}

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

    // 4. Retornar HTML Estruturado
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
            </div>

            <div class="status-badge ${statusClass}">
                ${statusLabel}
            </div>
        </div>
    `;
}