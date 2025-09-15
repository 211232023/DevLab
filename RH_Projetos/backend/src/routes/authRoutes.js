const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt'); // Importa a biblioteca bcrypt
const saltRounds = 10; // Custo do hash, um valor comum e seguro

// Rota de cadastro para candidatos (agora com senha criptografada)
router.post('/register/candidato', async (req, res) => {
    const { nome, cpf, email, senha } = req.body;
    try {
        // Criptografa a senha antes de salvar
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        const [result] = await db.execute(
            'INSERT INTO candidatos (nome, cpf, email, senha) VALUES (?, ?, ?, ?)',
            [nome, cpf, email, hashedPassword] // Salva a senha criptografada
        );
        res.status(201).json({ message: 'Candidato cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar candidato:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota de login para candidatos
router.post('/login/candidato', async (req, res) => {
    const { email, senha } = req.body;
    try {
        // Busca o usuário pelo e-mail
        const [rows] = await db.execute(
            'SELECT * FROM candidatos WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        const candidato = rows[0];

        // Compara a senha fornecida com a senha criptografada do banco
        const match = await bcrypt.compare(senha, candidato.senha);

        if (!match) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        // Login bem-sucedido
        res.status(200).json({ message: 'Login bem-sucedido!', user: { id: candidato.id, nome: candidato.nome } });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;