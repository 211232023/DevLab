const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/enviar-codigo', usuarioController.enviarCodigoVerificacao);

router.post('/validar-codigo', usuarioController.validarCodigoVerificacao);

router.post('/', usuarioController.createUsuario);

router.get('/', usuarioController.getAllUsuarios);

router.get('/:id', usuarioController.getUsuarioById);

router.put('/:id', usuarioController.updateUsuario);

router.delete('/:id', usuarioController.deleteUsuario);

module.exports = router;