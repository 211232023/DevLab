// Em: src/routes/usuarioRoutes.js

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// CORREÇÃO: Importar 'protect'
const {
  protect, // <--- MUDAR AQUI
  authorize,
} = require('../middleware/authMiddleware');

// ... (rotas públicas ficam iguais) ...

// --- Rotas Protegidas (Gestão de Admin) ---
router.get(
  '/',
  protect, // <--- MUDAR AQUI
  authorize('ADMIN'),
  usuarioController.getAllUsuarios
);
router.get(
  '/:id',
  protect, // <--- MUDAR AQUI
  authorize('ADMIN'),
  usuarioController.getUsuarioById
);

// Rota específica para atualizar APENAS o TIPO (Admin)
router.put(
  '/:id/tipo',
  protect, // <--- MUDAR AQUI
  authorize('ADMIN'),
  usuarioController.updateUsuarioTipo
);

// Rota para usuário atualizar o próprio perfil (requer login)
router.put(
  '/:id',
  protect, // <--- MUDAR AQUI
  usuarioController.updateUsuario
);

// Rota para deletar usuário (Admin)
router.delete(
  '/:id',
  protect, // <--- MUDAR AQUI
  authorize('ADMIN'),
  usuarioController.deleteUsuario
);

module.exports = router;