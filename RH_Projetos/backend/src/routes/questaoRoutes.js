const express = require('express');
const router = express.Router();
const questaoController = require('../controllers/questaoController');

// Rota para criar uma nova questão com alternativas
router.post('/', questaoController.createQuestao);

// Rota para listar todas as questões
router.get('/', questaoController.getAllQuestoes);

// Rota para deletar uma questão
router.delete('/:id', questaoController.deleteQuestao);

module.exports = router;