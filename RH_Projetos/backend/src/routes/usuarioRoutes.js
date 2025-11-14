const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { protect } = require('../middleware/authMiddleware');

router.post('/enviar-codigo', usuarioController.enviarCodigoVerificacao);

router.post('/validar-codigo', usuarioController.validarCodigoVerificacao);

router.post('/', usuarioController.createUsuario);

router.get('/', usuarioController.getAllUsuarios);

router.get('/:id', usuarioController.getUsuarioById);

router.put('/:id', usuarioController.updateUsuario);

router.put('/:id/tipo', protect, usuarioController.updateTipo);

router.delete('/:id', protect, usuarioController.deleteUsuario);

module.exports = router;