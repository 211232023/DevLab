const express = require('express');
const router = express.Router();
const candidatoController = require('../controllers/candidatoController');

router.get('/', candidatoController.getAllCandidatos);

module.exports = router;
