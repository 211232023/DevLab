const nodemailer = require("nodemailer");

// Configurações de ambiente (mova estas para um arquivo .env)
// SMTP_HOST=smtp.example.com
// SMTP_PORT=587
// SMTP_SECURE=false
// SMTP_USER=seu_usuario
// SMTP_PASS=sua_senha_ou_app_password
// MAIL_FROM="RH DevLab" <201622023@eniac.edu.br>
// APP_BASE_URL=http://localhost:5173



// ...existing code...
const express = require("express");
const router = express.Router();
const { atualizarEtapa } = require("../controllers/candidaturas.controller");

router.put("/candidaturas/:id/etapa", atualizarEtapa);

module.exports = router;
// ...existing code...
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // ex: smtp.sendgrid.net / smtp.gmail.com (com app password)
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verifica conexão (uma vez no boot)
(async () => {
  try {
    await transporter.verify();
    console.log("SMTP pronto para envio");
  } catch (err) {
    console.error("Falha ao verificar SMTP:", err);
  }
})();

function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || '"RH DevLab" <no-reply@devlab.com>';
  return transporter.sendMail({ from, to, subject, text, html });
}

// Template simples para avanço de etapa
function buildStageUpdateTemplate({ nome, vaga, etapa, link }) {
  const appUrl = process.env.APP_BASE_URL || "http://localhost:5173";
  const safeLink = link || `${appUrl}/minhas-candidaturas`;
  const subject = `Atualização do processo seletivo (${vaga}) — ${etapa}`;
  const text = `Olá ${nome},

Sua candidatura para a vaga ${vaga} avançou para a etapa: ${etapa}.
Acompanhe os detalhes em: ${safeLink}

Atenciosamente,
Equipe de RH`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto">
    <h2 style="color:#111">Atualização do processo seletivo</h2>
    <p>Olá ${nome},</p>
    <p>Sua candidatura para a vaga <strong>${vaga}</strong> avançou para a etapa:</p>
    <p style="font-size:16px"><strong>${etapa}</strong></p>
    <p>Você pode acompanhar os detalhes no portal:</p>
    <p>
      <a href="${safeLink}" style="background:#0d6efd;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block">
        Acessar minhas candidaturas
      </a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <small style="color:#666">Se você não esperava este email, ignore.</small>
  </div>`;

  return { subject, text, html };
}

async function sendStageUpdateEmail({ email, nome, vaga, etapa, link }) {
  const { subject, text, html } = buildStageUpdateTemplate({ nome, vaga, etapa, link });
  return sendMail({ to: email, subject, text, html });
}

module.exports = {
  sendMail,
  sendStageUpdateEmail,
};

// ...existing code...
const { sendStageUpdateEmail } = require("../../nodemailer");

async function atualizarEtapa(req, res) {
  const { id } = req.params;
  const { etapa } = req.body;

  try {
    // ...existing code...
    // 1) Atualize a etapa no banco
    const candidatura = await Candidatura.findByIdAndUpdate(
      id,
      { etapaAtual: etapa },
      { new: true }
    ).populate("candidato").populate("vaga"); // ajuste ao seu ORM

    if (!candidatura) return res.status(404).json({ error: "Candidatura não encontrada" });

    // 2) Dispare o email (não bloqueie a resposta se falhar)
    sendStageUpdateEmail({
      email: candidatura.candidato.email,
      nome: candidatura.candidato.nome,
      vaga: candidatura.vaga.titulo,
      etapa: candidatura.etapaAtual,
      link: `${process.env.APP_BASE_URL}/minhas-candidaturas/${candidatura._id}`,
    }).catch((err) => console.error("Falha ao enviar email de etapa:", err));

    // 3) Responda a API
    return res.json({ message: "Etapa atualizada com sucesso", candidatura });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar etapa" });
  }
}
// ...existing code...
module.exports = { atualizarEtapa };