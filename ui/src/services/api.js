const API_BASE_URL = 'http://localhost:5150/api'; // Usando HTTP na porta 5150

export const api = {
    // Client endpoints
    async registerClient(clientData) {
        // Verifica se o email já existe
        const existingClients = await this.getAllClients();
        const emailExists = existingClients.some(
            client => client.email.toLowerCase() === clientData.email.toLowerCase()
        );

        if (emailExists) {
            throw new Error('Este email já está cadastrado. Por favor, use outro email ou faça login.');
        }

        const response = await fetch(`${API_BASE_URL}/Client`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.Message || 'Falha ao cadastrar cliente');
        }

        return response.json();
    },

    async loginClient(email, password) {
        const response = await fetch(`${API_BASE_URL}/Client`);
        
        if (!response.ok) {
            throw new Error('Erro ao conectar com o servidor');
        }

        const clients = await response.json();
        
        const client = clients.find(c => 
            c.email.toLowerCase() === email.toLowerCase() && 
            c.password === password
        );
        
        if (!client) {
            throw new Error('Email ou senha incorretos');
        }
        
        if (!client.active) {
            throw new Error('Esta conta está inativa. Entre em contato com o suporte.');
        }
        
        return client;
    },

    async getAllClients() {
        const response = await fetch(`${API_BASE_URL}/Client`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar clientes');
        }
        
        return response.json();
    },

    async getClientById(id) {
        const response = await fetch(`${API_BASE_URL}/Client/${id}`);
        
        if (!response.ok) {
            throw new Error('Cliente não encontrado');
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
            throw new Error(error.Message || 'Falha ao criar pedido');
        }

        return response.json();
    },

    async getOrdersByClientId(clientId) {
        const response = await fetch(`${API_BASE_URL}/Order`);
        const orders = await response.json();
        
        return orders.filter(order => order.clientId === clientId);
    }
};