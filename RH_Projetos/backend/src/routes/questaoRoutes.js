const express = require('express');
const router = express.Router();
const questaoController = require('../controllers/questaoController');

router.post('/', questaoController.createQuestao);

router.get('/', questaoController.getAllQuestoes);

router.delete('/:id', questaoController.deleteQuestao);

module.exports = router;