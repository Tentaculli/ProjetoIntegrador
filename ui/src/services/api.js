const API_BASE_URL = 'http://localhost:5150/api'; // Usando HTTP na porta 5150

export const api = {
    // Client endpoints
    async registerClient(clientData) {
        const response = await fetch(`${API_BASE_URL}/Client`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.Message || 'Failed to register client');
        }

        return response.json();
    },

    async loginClient(email, password) {
        // Note: Você precisará criar um endpoint de login no back-end
        // Por enquanto, vamos buscar todos os clientes e validar no front
        const response = await fetch(`${API_BASE_URL}/Client`);
        const clients = await response.json();
        
        const client = clients.find(c => c.email === email && c.password === password);
        
        if (!client) {
            throw new Error('Invalid credentials');
        }
        
        return client;
    },

    async getClientById(id) {
        const response = await fetch(`${API_BASE_URL}/Client/${id}`);
        
        if (!response.ok) {
            throw new Error('Client not found');
        }
        
        return response.json();
    },

    // Order endpoints
    async createOrder(orderData) {
        const response = await fetch(`${API_BASE_URL}/Order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.Message || 'Failed to create order');
        }

        return response.json();
    },

    async getOrdersByClientId(clientId) {
        const response = await fetch(`${API_BASE_URL}/Order`);
        const orders = await response.json();
        
        return orders.filter(order => order.clientId === clientId);
    }
};