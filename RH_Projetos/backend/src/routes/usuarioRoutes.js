const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaController');

// Rota para listar todas as vagas
// GET /api/vagas
router.get('/', vagaController.listarVagas);

// Rota para cadastrar uma nova vaga
// POST /api/vagas
router.post('/', vagaController.cadastrarVaga);

// Rota para obter uma vaga específica por ID
// GET /api/vagas/1 (ou qualquer outro ID)
router.get('/:id', vagaController.getVagaPorId);

module.exports = router;