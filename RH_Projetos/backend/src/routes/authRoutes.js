const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/register/candidato', async (req, res) => {
    const { nome, cpf, email, telefone, genero, senha } = req.body;

    if (!nome || !cpf || !email || !telefone || !genero || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM candidatos WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await db.execute(
            'INSERT INTO candidatos (nome, cpf, email, telefone, genero, senha) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, cpf, email, telefone, genero, hashedPassword]
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
        const [rows] = await db.execute(
            'SELECT * FROM candidatos WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        const candidato = rows[0];
        const match = await bcrypt.compare(senha, candidato.senha);

        if (!match) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        res.status(200).json({ message: 'Login bem-sucedido!', user: { id: candidato.id, nome: candidato.nome, genero: candidato.genero } });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;