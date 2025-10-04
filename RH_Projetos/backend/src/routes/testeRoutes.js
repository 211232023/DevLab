const express = require('express');
const router = express.Router();
const testeController = require('../controllers/testeController');

router.post('/', testeController.createTeste);

router.get('/vaga/:vaga_id', testeController.getTesteByVagaId);

router.post('/:teste_id/questoes', testeController.addQuestaoToTeste);

router.delete('/:teste_id/questoes/:questao_id', testeController.removeQuestaoFromTeste);

router.get('/:id', testeController.getTesteById);

router.post('/:teste_id/candidatura/:candidatura_id/submeter', testeController.submeterTeste);

module.exports = router;