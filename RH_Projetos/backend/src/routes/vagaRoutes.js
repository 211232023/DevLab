const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota para cadastrar uma nova vaga
router.post('/', async (req, res) => {
    const { rh_id, titulo, area, salario, descricao, requisitos, manual } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO vagas (rh_id, titulo, area, salario, descricao, requisitos, manual) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [rh_id, titulo, area, salario, descricao, requisitos, manual]
        );
        res.status(201).json({ message: 'Vaga cadastrada com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar vaga:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para listar todas as vagas
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vagas');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para listar candidatos que se candidataram a uma vaga
router.get('/:id/candidatos', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT c.*, a.status FROM candidaturas AS a INNER JOIN candidatos AS c ON a.candidato_id = c.id WHERE a.vaga_id = ?',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nenhum candidato encontrado para esta vaga' });
        }
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar candidatos por vaga:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar uma vaga por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM vagas WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Vaga não encontrada' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar vaga por ID:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;