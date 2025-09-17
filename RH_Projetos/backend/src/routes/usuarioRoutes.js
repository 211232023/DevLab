const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rota para criar um novo usuário (POST /api/usuarios)
router.post('/', usuarioController.createUsuario);

// Rota para buscar todos os usuários (GET /api/usuarios)
router.get('/', usuarioController.getAllUsuarios);

// Rota para buscar um usuário pelo ID (GET /api/usuarios/:id)
router.get('/:id', usuarioController.getUsuarioById);

// Rota para ATUALIZAR um usuário (PUT /api/usuarios/:id) - A rota que faltava!
router.put('/:id', usuarioController.updateUsuario);

// Rota para deletar um usuário (DELETE /api/usuarios/:id)
router.delete('/:id', usuarioController.deleteUsuario);

module.exports = router;