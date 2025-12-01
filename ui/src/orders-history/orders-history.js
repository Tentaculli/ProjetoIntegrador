import { api } from '../services/api.js';

document.addEventListener("DOMContentLoaded", () => {
    carregarPedidos();
});

async function carregarPedidos() {
    const container = document.getElementById("lista-pedidos");
    
    // Verificar se o usuário está logado
    const clientData = localStorage.getItem('currentClient');
    if (!clientData) {
        container.innerHTML = `
            <div style="text-align:center; padding: 2rem; color: #777;">
                Você precisa estar logado para ver suas encomendas.
                <br><br>
                <a href="../login/login.html" style="color: #a970ff;">Clique aqui para fazer login</a>
            </div>
        `;
        return;
    }

    const client = JSON.parse(clientData);

    try {
        // Buscar pedidos da API
        const pedidos = await api.getOrdersByClientId(client.id);
        
        container.innerHTML = "";
        
        if (pedidos.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 2rem; color: #777;">
                    Você ainda não fez nenhuma encomenda.
                </div>
            `;
            return;
        }

        // Ordenar pedidos por data (mais recentes primeiro)
        pedidos.sort((a, b) => new Date(b.created) - new Date(a.created));

        pedidos.forEach(pedido => {
            const cardHTML = criarCardHTML(pedido);
            container.innerHTML += cardHTML;
        });
        
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        container.innerHTML = `
            <div style="text-align:center; padding: 2rem; color: #dc3545;">
                Erro ao carregar pedidos. Por favor, tente novamente mais tarde.
            </div>
        `;
    }
}

function criarCardHTML(pedido) {
    let statusLabel, statusClass;

    // Mapear status da API para a interface
    switch(pedido.status) {
        case "Waiting":
        case "waiting":
        case 1:
            statusLabel = "Aguardando";
            statusClass = "produzindo";
            break;
        case "InProgress":
        case "inprogress":
        case 2:
            statusLabel = "Em Produção";
            statusClass = "produzindo";
            break;
        case "Finished":
        case "finished":
        case 3:
            statusLabel = "Entregue";
            statusClass = "entregue";
            break;
        case "Canceled":
        case "canceled":
        case 4:
            statusLabel = "Cancelado";
            statusClass = "cancelado";
            break;
        default:
            statusLabel = "Pendente";
            statusClass = "";
    }

    // Mapear ShapeType enum para números da interface
    const mapearShape = (shape) => {
        if (typeof shape === 'number') return shape;
        switch(shape) {
            case "None": return 0;
            case "Hexagon": return 3;
            case "Square": return 2;
            case "Circle": return 1;
            default: return 0;
        }
    };

    // Montar array de configuração
    const config = [
        mapearShape(pedido.pin1Pos1),
        mapearShape(pedido.pin1Pos2),
        mapearShape(pedido.pin1Pos3),
        mapearShape(pedido.pin2Pos1),
        mapearShape(pedido.pin2Pos2),
        mapearShape(pedido.pin2Pos3)
    ];

    const pino1 = config.slice(0, 3);
    const pino2 = config.slice(3, 6);

    const htmlPino1 = pino1.map(tipo => 
        tipo === 0 
            ? `<div class="mini-peca vazio"></div>` 
            : `<div class="mini-peca tipo-${tipo}" title="Peça ${tipo}"></div>`
    ).join('');

    const htmlPino2 = pino2.map(tipo => 
        tipo === 0 
            ? `<div class="mini-peca vazio"></div>` 
            : `<div class="mini-peca tipo-${tipo}" title="Peça ${tipo}"></div>`
    ).join('');

    // Formatar data
    const dataFormatada = new Date(pedido.created).toLocaleDateString('pt-BR');

    return `
        <div class="order-card">
            <div class="order-info">
                <div class="order-header">
                    <h3>Pedido #${pedido.id}</h3>
                    <span class="order-date">${dataFormatada}</span>
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

function fazerLogout() {
    localStorage.removeItem('currentClient');
    window.location.href = '../login/login.html';
}