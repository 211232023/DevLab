const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true, // ativa logs do nodemailer
  debug: true,  // ativa debug da sessão SMTP
  connectionTimeout: Number(process.env.SMTP_CONN_TIMEOUT) || 10000, // 10s
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 5000,
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT) || 10000,
  tls: {
    // por padrão true; defina SMTP_TLS_REJECT="false" para diagnóstico local
    rejectUnauthorized: process.env.SMTP_TLS_REJECT !== "false"
  }
});

// Verifica conexão
(async () => {
  try {
    await transporter.verify();
    console.log("✓ SMTP pronto para envio");
    console.log("📍 APP_BASE_URL configurada:", process.env.APP_BASE_URL);
  } catch (err) {
    console.error("✗ Falha ao verificar SMTP:", err.code || err.message);
    console.error(err);
  }
})();

function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || '"RH DevLab" <no-reply@devlab.com>';
  return transporter.sendMail({ from, to, subject, text, html });
}

function buildStageUpdateTemplate({ nome, vaga, etapa, link }) {
  const appUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const safeLink = link || `${appUrl}/minhas-candidaturas`;
  
  console.log("🔗 Link gerado no email:", safeLink);
  
  const subject = `Atualização do processo seletivo (${vaga}) — ${etapa}`;
  const text = `Olá ${nome},

Sua candidatura para a vaga ${vaga} avançou para a etapa: ${etapa}.
Acompanhe os detalhes em: ${safeLink}

Atenciosamente,
Equipe de RH`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto">
    <h2 style="color:#111">Atualização do processo seletivo</h2>
    <p>Olá <strong>${nome}</strong>,</p>
    <p>Sua candidatura para a vaga <strong>${vaga}</strong> avançou para a etapa:</p>
    <p style="font-size:18px;color:#0d6efd"><strong>${etapa}</strong></p>
    <p>Você pode acompanhar os detalhes no portal:</p>
    <p style="margin:24px 0">
      <a href="${safeLink}" 
         style="background:#0d6efd;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold"
         target="_blank">
        Acessar Minhas Candidaturas
      </a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="color:#666;font-size:12px">
      Se você não esperava este email, ignore-o com segurança.<br>
      Este é um email automático, por favor não responda.
    </p>
  </div>`;

  return { subject, text, html };
}

// Template para notificar que a candidatura NÃO continuará (exclusão)
function buildRejectionTemplate({ nome, vaga, motivo, link }) {
  const appUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const safeLink = link || `${appUrl}/minhas-candidaturas`;
  const subject = `Status da candidatura (${vaga}) — candidatura encerrada`;
  const text = `Olá ${nome},

Informamos que sua candidatura para a vaga "${vaga}" não terá continuidade.
${motivo ? `Motivo: ${motivo}\n\n` : ''}Você pode ver mais detalhes no portal: ${safeLink}

Atenciosamente,
Equipe de RH`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto">
    <h2 style="color:#d9534f">Candidatura encerrada</h2>
    <p>Olá <strong>${nome}</strong>,</p>
    <p>Informamos que sua candidatura à vaga <strong>${vaga}</strong> não seguirá para as próximas etapas.</p>
    ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
    <p style="margin:20px 0">Se desejar, você pode acessar o portal para ver mais informações:</p>
    <p style="margin:24px 0">
      <a href="${safeLink}"
         style="background:#6c757d;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold"
         target="_blank">
        Ver Minhas Candidaturas
      </a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="color:#666;font-size:12px">
      Se você não esperava este email, ignore-o.<br>
      Este é um email automático, por favor não responda.
    </p>
  </div>`;
  return { subject, text, html };
}

async function sendStageUpdateEmail({ email, nome, vaga, etapa, link }) {
  const { subject, text, html } = buildStageUpdateTemplate({ nome, vaga, etapa, link });
  return sendMail({ to: email, subject, text, html });
}

async function sendRejectionEmail({ email, nome, vaga, motivo, link }) {
  const { subject, text, html } = buildRejectionTemplate({ nome, vaga, motivo, link });
  try {
    const result = await sendMail({ to: email, subject, text, html });
    console.log("✓ Email de encerramento enviado para", email);
    return result;
  } catch (err) {
    console.error("✗ Erro ao enviar email de encerramento:", err.message || err);
    throw err;
  }
}

module.exports = {
  sendMail,
  sendStageUpdateEmail,
  sendRejectionEmail,
};