const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaController');

// Rota para criar uma nova vaga
router.post('/', vagaController.createVaga);

// Rota para buscar todas as vagas
router.get('/', vagaController.getAllVagas);

// Rota para buscar uma vaga pelo ID
router.get('/:id', vagaController.getVagaById);

// Rota para atualizar uma vaga
router.put('/:id', vagaController.updateVaga);

// Rota para deletar uma vaga
router.delete('/:id', vagaController.deleteVaga);

module.exports = router;