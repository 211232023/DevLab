const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('ADMIN', 'RH'), vagaController.createVaga);

router.get('/', protect, authorize('ADMIN', 'RH', 'CANDIDATO'), vagaController.getAllVagas);

router.get('/:id', vagaController.getVagaById);

router.get('/:vagaId/candidatos', protect, authorize('ADMIN', 'RH'), vagaController.getCandidatosPorVaga);

router.put('/:id', protect, authorize('ADMIN', 'RH'), vagaController.updateVaga);

router.delete('/:id', protect, authorize('ADMIN', 'RH'), vagaController.deleteVaga);

router.get('/gestao/:recrutador_id', protect, authorize('ADMIN', 'RH'), vagaController.listarVagasComCandidatos);

router.get('/usuario/:usuario_id', protect, vagaController.listarVagasPorUsuario);

router.post('/completa', protect, authorize('ADMIN', 'RH'), vagaController.createVagaCompleta);

module.exports = router;