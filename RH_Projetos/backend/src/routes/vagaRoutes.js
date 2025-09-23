const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /vagas -> Criar uma nova vaga
router.post('/', protect, authorize('ADMIN', 'RH'), vagaController.createVaga);

// GET /vagas -> Obter todas as vagas (protegida para ADMIN e RH)
router.get('/', protect, authorize('ADMIN', 'RH', 'CANDIDATO'), vagaController.getAllVagas);

// GET /vagas/:id -> Obter uma vaga específica
router.get('/:id', vagaController.getVagaById);

// GET /vagas/:vagaId/candidatos -> Obter todos os candidatos de uma vaga
router.get('/:vagaId/candidatos', protect, authorize('ADMIN', 'RH'), vagaController.getCandidatosPorVaga);

// PUT /vagas/:id -> Atualizar uma vaga
router.put('/:id', protect, authorize('ADMIN', 'RH'), vagaController.updateVaga);

// DELETE /vagas/:id -> Deletar uma vaga
router.delete('/:id', protect, authorize('ADMIN', 'RH'), vagaController.deleteVaga);

// Rota para buscar todas as vagas de um recrutador e seus candidatos
router.get('/gestao/:recrutador_id', protect, authorize('ADMIN', 'RH'), vagaController.listarVagasComCandidatos);

// Rota para buscar todas as vagas de um usuário específico
router.get('/usuario/:usuario_id', protect, vagaController.listarVagasPorUsuario);

// Rota para criar uma vaga completa (vaga + teste + questões)
router.post('/completa', protect, authorize('ADMIN', 'RH'), vagaController.createVagaCompleta);

module.exports = router;