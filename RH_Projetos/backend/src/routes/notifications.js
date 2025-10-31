const express = require('express');
const router = express.Router();
const { sendRejectionEmail } = require('../../nodemailer');

// POST /notifications/rejection
// body: { email, nome, vaga, link }
router.post('/rejection', async (req, res) => {
  const { email, nome, vaga, link } = req.body;
  if (!email) return res.status(400).json({ error: 'email é obrigatório' });
  try {
    await sendRejectionEmail({ email, nome, vaga, link });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao enviar email de rejeição:', err);
    return res.status(500).json({ error: 'Falha ao enviar email' });
  }
});

module.exports = router;