const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verifica conexão
(async () => {
  try {
    await transporter.verify();
    console.log("✓ SMTP pronto para envio");
  } catch (err) {
    console.error("✗ Falha ao verificar SMTP:", err.message);
  }
})();

function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || '"RH DevLab" <no-reply@devlab.com>';
  return transporter.sendMail({ from, to, subject, text, html });
}

function buildStageUpdateTemplate({ nome, vaga, etapa, link }) {
  const appUrl = process.env.APP_BASE_URL || "http://localhost:3001";
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