const express = require('express');
const router = express.Router();
const candidaturaController = require('../controllers/candidaturaController');
const { protect } = require('../middleware/authMiddleware');
const fileUpload = require('express-fileupload');

router.post('/vagas/:vaga_id', protect, fileUpload(), candidaturaController.inscreverCandidato);

router.post('/:id/documentos', protect, fileUpload(), candidaturaController.uploadDocumento);

router.get('/minhas', protect, candidaturaController.listarMinhasCandidaturas);

router.get('/usuario/:candidato_id', candidaturaController.listarCandidaturasPorCandidato);

router.delete('/:candidatura_id', candidaturaController.desistirDeVaga);

router.get('/vagas/:vagaId/candidatos', candidaturaController.getCandidatosPorVaga);

router.put('/:id/status', candidaturaController.updateStatusCandidatura);

router.delete('/:id', candidaturaController.deleteCandidatura);

router.get('/:id', candidaturaController.getCandidaturaById);

module.exports = router;