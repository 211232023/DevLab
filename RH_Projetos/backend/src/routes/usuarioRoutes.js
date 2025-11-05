const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// CORREÇÃO: Importando 'authorize' em vez de 'authRoles'
const {
  proteger,
  authorize,
} = require('../middleware/authMiddleware');

// --- Rotas Públicas (Cadastro e Verificação) ---
router.post('/enviar-codigo', usuarioController.enviarCodigoVerificacao);
router.post('/validar-codigo', usuarioController.validarCodigoVerificacao);
router.post('/', usuarioController.createUsuario); // Cadastro de novo usuário

// --- Rotas Públicas (Reset de Senha) ---
router.post(
  '/request-password-reset',
  usuarioController.requestPasswordReset
);
router.post('/reset-password/:token', usuarioController.resetPassword);

// --- Rotas Protegidas (Gestão de Admin) ---
// CORREÇÃO: Usando 'authorize'
router.get(
  '/',
  proteger,
  authorize('ADMIN'),
  usuarioController.getAllUsuarios
);
router.get(
  '/:id',
  proteger,
  authorize('ADMIN'),
  usuarioController.getUsuarioById
);

// Rota específica para atualizar APENAS o TIPO (Admin)
// CORREÇÃO: Usando 'authorize'
router.put(
  '/:id/tipo',
  proteger,
  authorize('ADMIN'),
  usuarioController.updateUsuarioTipo
);

// Rota para usuário atualizar o próprio perfil (requer login)
// A lógica de permissão (self-update vs admin-update) está no controller.
router.put('/:id', proteger, usuarioController.updateUsuario);

// Rota para deletar usuário (Admin)
// CORREÇÃO: Usando 'authorize'
router.delete(
  '/:id',
  proteger,
  authorize('ADMIN'),
  usuarioController.deleteUsuario
);

module.exports = router;