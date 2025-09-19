const express = require('express');
const router = express.Router();
const testeController = require('../controllers/testeController');

// Rota para criar um novo teste associado a uma vaga
router.post('/', testeController.createTeste);

// Rota para buscar o teste de uma vaga específica
router.get('/vaga/:vaga_id', testeController.getTesteByVagaId);

// Rota para adicionar uma questão a um teste
router.post('/:teste_id/questoes', testeController.addQuestaoToTeste);

// Rota para remover uma questão de um teste
router.delete('/:teste_id/questoes/:questao_id', testeController.removeQuestaoFromTeste);

module.exports = router;