const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.resolve(__dirname, '../config/db'));

// Rota para um usuário se candidatar a uma vaga
router.post('/', async (req, res) => {
    const { usuario_id, vaga_id } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO candidaturas (usuario_id, vaga_id, data_inscricao, status) VALUES (?, ?, NOW(), ?)',
            [usuario_id, vaga_id, 'Inscrito']
        );
        res.status(201).json({ message: 'Candidatura realizada com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao se candidatar à vaga:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para listar todas as candidaturas de um usuário
router.get('/usuario/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT v.titulo, v.area, v.salario, c.status, c.data_inscricao FROM candidaturas AS c INNER JOIN vagas AS v ON c.vaga_id = v.id WHERE c.usuario_id = ?',
            [usuario_id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar candidaturas do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;