document.addEventListener("DOMContentLoaded", () => {
    carregarPedidos();
});

const mockPedidos = [
    {
        id: 1045,
        data: "28/11/2025",
        status: "produzindo",
        config: [2, 1, 0, 3, 3, 0]
    },
    {
        id: 1042,
        data: "25/11/2025",
        status: "entregando",
        config: [3, 2, 1, 1, 1, 1]
    },
    {
        id: 1030,
        data: "10/11/2025",
        status: "entregue",
        config: [2, 0, 0, 2, 0, 0]
    }
];

function carregarPedidos() {
    const container = document.getElementById("lista-pedidos");
    setTimeout(() => {
        container.innerHTML = "";
        if (mockPedidos.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 2rem; color: #777;">Você ainda não fez nenhuma encomenda.</div>`;
            return;
        }
        mockPedidos.forEach(pedido => {
            const cardHTML = criarCardHTML(pedido);
            container.innerHTML += cardHTML;
        });
    }, 500);
}

function criarCardHTML(pedido) {
    let statusLabel, statusClass;

    switch(pedido.status) {
        case "produzindo": statusLabel = "Em Produção"; statusClass = "produzindo"; break;
        case "entregando": statusLabel = "Em Trânsito"; statusClass = "entregando"; break;
        case "entregue": statusLabel = "Entregue"; statusClass = "entregue"; break;
        default: statusLabel = "Pendente"; statusClass = "";
    }

    const pino1 = pedido.config.slice(0, 3);
    const pino2 = pedido.config.slice(3, 6);

    const htmlPino1 = pino1.map(tipo => `<div class="mini-peca tipo-${tipo}" title="Peça ${tipo}"></div>`).join('');
    const htmlPino2 = pino2.map(tipo => `<div class="mini-peca tipo-${tipo}" title="Peça ${tipo}"></div>`).join('');

    return `
        <div class="order-card">
            <div class="order-info">
                <div class="order-header">
                    <h3>Pedido #${pedido.id}</h3>
                    <span class="order-date">${pedido.data}</span>
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