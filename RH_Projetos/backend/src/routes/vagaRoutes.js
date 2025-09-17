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

module.exports = router;