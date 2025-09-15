const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

module.exports = router;