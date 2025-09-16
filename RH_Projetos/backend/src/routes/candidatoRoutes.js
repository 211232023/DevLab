const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.resolve(__dirname, '../config/db'));

// Rota para candidatura de uma vaga
router.post('/:candidato_id/candidaturas', async (req, res) => {
    const { candidato_id } = req.params;
    const { vaga_id } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO candidaturas (candidato_id, vaga_id) VALUES (?, ?)',
            [candidato_id, vaga_id]
        );
        res.status(201).json({ message: 'Candidatura realizada com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao se candidatar à vaga:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para listar todas as candidaturas de um candidato
router.get('/:id/candidaturas', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT v.titulo, v.area, v.salario, a.status, a.data_inscricao FROM candidaturas AS a INNER JOIN vagas AS v ON a.vaga_id = v.id WHERE a.candidato_id = ?',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Candidaturas não encontradas para este candidato' });
        }
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar candidaturas do candidato:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;