const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota para criar um novo teste
router.post('/', async (req, res) => {
    const { vaga_id, titulo, descricao } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO testes (vaga_id, titulo, descricao) VALUES (?, ?, ?)',
            [vaga_id, titulo, descricao]
        );
        res.status(201).json({ message: 'Teste criado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao criar teste:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para adicionar uma questão a um teste
router.post('/:teste_id/questoes', async (req, res) => {
    const { teste_id } = req.params;
    const { enunciado, tipo, opcoes } = req.body;
    try {
        const [questaoResult] = await db.execute(
            'INSERT INTO questoes (teste_id, enunciado, tipo) VALUES (?, ?, ?)',
            [teste_id, enunciado, tipo]
        );
        const questaoId = questaoResult.insertId;

        // Se for de múltipla escolha, insere as opções
        if (tipo === 'multipla_escolha' && opcoes && opcoes.length > 0) {
            const optionsToInsert = opcoes.map(opt => [questaoId, opt.texto, opt.correta]);
            const [opcoesResult] = await db.query(
                'INSERT INTO opcoes (questao_id, texto, correta) VALUES ?',
                [optionsToInsert]
            );
        }

        res.status(201).json({ message: 'Questão e opções adicionadas com sucesso!', questaoId });
    } catch (error) {
        console.error('Erro ao adicionar questão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;