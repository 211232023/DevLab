const express = require('express');
const router = express.Router();
const candidaturaController = require('../controllers/candidaturaController');

// CORREÇÃO AQUI: Adicionamos 'authorize' na importação
const { protect, authorize } = require('../middleware/authMiddleware');

// Rota para se inscrever em uma vaga
router.post(
  '/:vaga_id/inscrever',
  protect,
  authorize(['CANDIDATO']),
  candidaturaController.inscreverCandidato
);

// Rota para o candidato listar suas próprias candidaturas
router.get(
  '/minhas-candidaturas',
  protect,
  authorize(['CANDIDATO']),
  candidaturaController.listarMinhasCandidaturas
);

// Rota para o RH/Admin buscar candidatos de uma vaga específica
router.get(
  '/vagas/:vagaId/candidatos',
  protect,
  authorize(['ADMIN', 'RH']),
  candidaturaController.getCandidatosPorVaga
);

// --- NOVA ROTA ADICIONADA ---
// Rota para o RH/Admin buscar os documentos de uma candidatura específica
router.get(
  '/:id/documentos',
  protect,
  authorize(['ADMIN', 'RH']),
  candidaturaController.getDocumentosPorCandidatura
);

// Rota para obter uma candidatura específica pelo ID
router.get(
  '/:id',
  protect,
  candidaturaController.getCandidaturaById
);

// Rota para atualizar o status de uma candidatura (usada por candidato e RH)
router.put(
  '/:id/status',
  protect,
  candidaturaController.updateStatusCandidatura
);

// Rota para o RH/Admin deletar uma candidatura
router.delete(
  '/:id',
  protect,
  authorize(['ADMIN', 'RH']),
  candidaturaController.deleteCandidatura
);

module.exports = router;