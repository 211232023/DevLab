const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota de cadastro para candidatos
router.post('/register/candidato', async (req, res) => {
    const { nome, cpf, email, senha } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO candidatos (nome, cpf, email, senha) VALUES (?, ?, ?, ?)',
            [nome, cpf, email, senha]
        );
        res.status(201).json({ message: 'Candidato cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar candidato:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota de cadastro para RH
router.post('/register/rh', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO rh (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senha]
        );
        res.status(201).json({ message: 'Usuário RH cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar RH:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;