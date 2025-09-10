const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaController');

router.post('/', vagaController.createVaga);
router.get('/', vagaController.getAllVagas);
router.get('/:id', vagaController.getVagaById);
router.put('/:id', vagaController.updateVaga);
router.delete('/:id', vagaController.deleteVaga);

module.exports = router;
