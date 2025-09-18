const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaController');

// POST /vagas -> Criar uma nova vaga
router.post('/', vagaController.createVaga);

// GET /vagas -> Obter todas as vagas
router.get('/', vagaController.getAllVagas);

// GET /vagas/:id -> Obter uma vaga específica
router.get('/:id', vagaController.getVagaById);

// PUT /vagas/:id -> Atualizar uma vaga
router.put('/:id', vagaController.updateVaga);

// DELETE /vagas/:id -> Deletar uma vaga
router.delete('/:id', vagaController.deleteVaga);

// Rota para buscar todas as vagas de um recrutador e seus candidatos
router.get('/gestao/:recrutador_id', vagaController.listarVagasComCandidatos);

// Rota para buscar todas as vagas de um usuário específico
router.get('/usuario/:usuario_id', vagaController.listarVagasPorUsuario);

module.exports = router;