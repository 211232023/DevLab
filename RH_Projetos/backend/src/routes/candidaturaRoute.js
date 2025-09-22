const express = require('express');
const router = express.Router();
const candidaturaController = require('../controllers/candidaturaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/vagas/:vaga_id', protect, candidaturaController.inscreverCandidato);

// Rota para listar todas as candidaturas de um usuário (ex: GET /api/candidaturas/usuario/5)
router.get('/usuario/:candidato_id', candidaturaController.listarCandidaturasPorCandidato);

router.delete('/:candidatura_id', candidaturaController.desistirDeVaga);

// Rota para listar todos os candidatos de uma vaga (ex: GET /api/candidaturas/vagas/12/candidatos)
router.get('/vagas/:vaga_id/candidatos', candidaturaController.listarCandidatosPorVaga);

// Rota para ATUALIZAR o status de uma candidatura
router.put('/:id/status', candidaturaController.updateStatusCandidatura);

// Rota para DELETAR uma candidatura
router.delete('/:id', candidaturaController.deleteCandidatura);

// Rota para buscar uma candidatura específica pelo ID
router.get('/:id', candidaturaController.getCandidaturaById);

module.exports = router;