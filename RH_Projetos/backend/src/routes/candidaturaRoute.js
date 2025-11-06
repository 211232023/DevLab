const express = require('express');
const router = express.Router();
const candidaturaController = require('../controllers/candidaturaController');
const { protect } = require('../middleware/authMiddleware');
const fileUpload = require('express-fileupload');

// Rotas públicas/protegidas organizadas por especificidade

// Inscrição em vaga (usuário autenticado)
router.post('/vagas/:vaga_id', protect, fileUpload(), candidaturaController.inscreverCandidato);

// Upload de documentos para candidatura
router.post('/:id/documentos', protect, fileUpload(), candidaturaController.uploadDocumento);

// Listar minhas candidaturas (usuário)
router.get('/minhas', protect, candidaturaController.listarMinhasCandidaturas);

// Listar candidaturas de um usuário (admin/mesmo usuário)
router.get('/usuario/:candidato_id', protect, candidaturaController.listarCandidaturasPorCandidato);

// Listar candidatos por vaga (RH/ADMIN)
router.get('/vagas/:vagaId/candidatos', protect, candidaturaController.getCandidatosPorVaga);

// Atualizar status de candidatura (RH/ADMIN)
router.put('/:id/status', protect, candidaturaController.updateStatusCandidatura);

// Candidato desiste da vaga (usuário autenticado) — path não conflita mais
router.delete('/:id/desistir', protect, candidaturaController.desistirDeVaga);

// Deletar candidatura (admin) - busca por id genérico
router.delete('/:id', protect, candidaturaController.deleteCandidatura);

// Obter candidatura por id
router.get('/:id', protect, candidaturaController.getCandidaturaById);

module.exports = router;