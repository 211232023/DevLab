const express = require('express');
const router = express.Router();
const candidaturaController = require('../controllers/candidaturaController');
const { protect } = require('../middleware/authMiddleware');
const fileUpload = require('express-fileupload');

router.post('/vagas/:vaga_id', protect, fileUpload(), candidaturaController.inscreverCandidato);

// Adicione a rota de upload de documentos aqui
router.post('/:id/documentos', protect, fileUpload(), candidaturaController.uploadDocumento);

// Esta rota deve vir ANTES da rota com parâmetro '/:candidato_id' para evitar conflitos
router.get('/minhas', protect, candidaturaController.listarMinhasCandidaturas);

// Rota para listar todas as candidaturas de um usuário (ex: GET /api/candidaturas/usuario/5)
router.get('/usuario/:candidato_id', candidaturaController.listarCandidaturasPorCandidato);

router.delete('/:candidatura_id', candidaturaController.desistirDeVaga);

// Rota para buscar os candidatos de uma vaga específica
router.get('/vagas/:vagaId/candidatos', candidaturaController.getCandidatosPorVaga);

// Rota para ATUALIZAR o status de uma candidatura
router.put('/:id/status', candidaturaController.updateStatusCandidatura);

// Rota para DELETAR uma candidatura
router.delete('/:id', candidaturaController.deleteCandidatura);

// Rota para buscar uma candidatura específica pelo ID
router.get('/:id', candidaturaController.getCandidaturaById);

module.exports = router;