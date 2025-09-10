const express = require('express');
const router = express.Router();
const candidatoController = require('../controllers/candidatoController');

router.post('/', candidatoController.createCandidato);
router.get('/', candidatoController.getAllCandidatos);
router.get('/:id', candidatoController.getCandidatoById);
router.put('/:id', candidatoController.updateCandidato);
router.delete('/:id', candidatoController.deleteCandidato);

module.exports = router;
