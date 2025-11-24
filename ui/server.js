// 1. Importar as bibliotecas
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');

// 2. Configurar o servidor
const app = express();
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(cors()); // Permite a comunicação entre frontend e backend
const PORT = 3000;

// 3. Conectar ao banco de dados SQLite (ele cria o arquivo se não existir)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Erro ao abrir o banco de dados", err.message);
    } else {
        console.log("Conectado ao banco de dados SQLite.");
        // Cria a tabela de usuários se ela não existir
        db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)', (err) => {
            if (err) {
                console.error("Erro ao criar a tabela", err.message);
            }
        });
    }
});

// --- PONTOS DE ACESSO (ENDPOINTS) DA API ---

// 4. Endpoint para CADASTRAR um novo usuário
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Criptografa a senha antes de salvar
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.run(sql, [email, hashedPassword], function(err) {
        if (err) {
            // Verifica se o erro é por email duplicado
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Conta criada com sucesso!', userId: this.lastID });
    });
});

// 5. Endpoint para LOGAR um usuário
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Se o usuário não for encontrado
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Compara a senha enviada com a senha criptografada no banco
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Senha correta
            res.status(200).json({ message: 'Login efetuado com sucesso!', user: { email: user.email } });
        } else {
            // Senha incorreta
            res.status(401).json({ error: 'Senha incorreta.' });
        }
    });
});


// 6. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});