document.addEventListener("DOMContentLoaded", () => {
    carregarPedidos();
});

// ============================================================================
// DADOS MOCKADOS (Simulação do Banco de Dados)
// ============================================================================
// status possíveis: 'produzindo', 'entregando', 'entregue'
// config: [pino1_base, pino1_meio, pino1_topo, pino2_base, pino2_meio, pino2_topo]
// IDs das peças: 1=Círculo, 2=Quadrado, 3=Hexágono, 0=Vazio

const mockPedidos = [
    {
        id: 1045,
        data: "28/11/2025",
        status: "produzindo",
        config: [2, 1, 0, 3, 3, 0] // Ex: Quadrado, Círculo (Pino 1) | Hexágono, Hexágono (Pino 2)
    },
    {
        id: 1042,
        data: "25/11/2025",
        status: "entregando",
        config: [3, 2, 1, 1, 1, 1] // Completo
    },
    {
        id: 1030,
        data: "10/11/2025",
        status: "entregue",
        config: [2, 0, 0, 2, 0, 0] // Apenas bases quadradas
    }
];

// ============================================================================
// FUNÇÃO PRINCIPAL: Carregar e Renderizar
// ============================================================================
function carregarPedidos() {
    const container = document.getElementById("lista-pedidos");
    
    // Simulação de delay de rede
    setTimeout(() => {
        container.innerHTML = ""; // Limpa o "Carregando..."

        if (mockPedidos.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 2rem; color: #777;">
                    Você ainda não fez nenhuma encomenda.
                </div>
            `;
            return;
        }

        // Gera o HTML para cada pedido
        mockPedidos.forEach(pedido => {
            const cardHTML = criarCardHTML(pedido);
            container.innerHTML += cardHTML;
        });
    }, 500);
}

// ============================================================================
// GERADOR DE HTML DO CARD
// ============================================================================
function criarCardHTML(pedido) {
    // 1. Define textos e classes baseados no status
    let statusLabel, statusClass;

    switch(pedido.status) {
        case "produzindo":
            statusLabel = "Em Produção";
            statusClass = "produzindo";
            break;
        case "entregando":
            statusLabel = "Em Trânsito";
            statusClass = "entregando";
            break;
        case "entregue":
            statusLabel = "Entregue";
            statusClass = "entregue";
            break;
        default:
            statusLabel = "Pendente";
            statusClass = "";
    }

    // 2. Gera o visual das peças (Divide o array em 2 pinos)
    const pino1 = pedido.config.slice(0, 3);
    const pino2 = pedido.config.slice(3, 6);

    const htmlPino1 = pino1.map(tipo => `<div class="mini-peca tipo-${tipo}" title="Peça ${tipo}"></div>`).join('');
    const htmlPino2 = pino2.map(tipo => `<div class="mini-peca tipo-${tipo}" title="Peça ${tipo}"></div>`).join('');

    // 3. Monta o Card final
    return `
        <div class="order-card">
            <div class="order-info">
                <div class="order-header">
                    <h3>Pedido #${pedido.id}</h3>
                    <span class="order-date">${pedido.data}</span>
                </div>
                
                <div class="visual-config">
                    <!-- Pino 1 -->
                    ${htmlPino1}
                    
                    <!-- Divisor -->
                    <div class="pino-divisor"></div>
                    
                    <!-- Pino 2 -->
                    ${htmlPino2}
                </div>
            </div>

            <div class="status-badge ${statusClass}">
                ${statusLabel}
            </div>
        </div>
    `;
}