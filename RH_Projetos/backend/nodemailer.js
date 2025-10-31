const nodemailer = require("nodemailer");
const dns = require("dns").promises;

let transporter = null;
let transporterReady = (async () => {
  const originalHost = process.env.SMTP_HOST || "";
  let hostToUse = originalHost;
  const ipv4Regex = /^\d+\.\d+\.\d+\.\d+$/;

  // Tenta resolver para IPv4 (evita rota IPv6/ENETUNREACH)
  if (originalHost && !ipv4Regex.test(originalHost)) {
    try {
      const { address } = await dns.lookup(originalHost, { family: 4 });
      hostToUse = address;
      console.log("🔎 SMTP host resolvido para IPv4:", hostToUse);
    } catch (err) {
      console.warn("⚠️ Não foi possível resolver IPv4 — usando host original:", err.message);
      hostToUse = originalHost;
    }
  }

  transporter = nodemailer.createTransport({
    host: hostToUse || process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
    connectionTimeout: Number(process.env.SMTP_CONN_TIMEOUT) || 15000,
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 10000,
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT) || 15000,
    tls: {
      // garante SNI/validação pelo hostname original quando 'host' for um IP
      servername: originalHost || undefined,
      // definir SMTP_TLS_REJECT="false" apenas para diagnóstico local
      rejectUnauthorized: process.env.SMTP_TLS_REJECT !== "false"
    }
  });

  try {
    await transporter.verify();
    console.log("✓ SMTP pronto para envio");
    console.log("📍 APP_BASE_URL configurada:", process.env.APP_BASE_URL);
  } catch (err) {
    console.error("✗ Falha ao verificar SMTP:", err && err.message ? err.message : err);
  }
})();

async function sendMail({ to, subject, text, html }) {
  await transporterReady;
  const from = process.env.MAIL_FROM || '"RH DevLab" <no-reply@devlab.com>';
  return transporter.sendMail({ from, to, subject, text, html });
}

function buildStageUpdateTemplate({ nome, vaga, etapa, link }) {
  const appUrl = process.env.APP_BASE_URL || "http://localhost:3000";
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
    <p>Olá <strong>${nome}</strong>,</p>
    <p>Sua candidatura para a vaga <strong>${vaga}</strong> avançou para a etapa:</p>
    <p style="font-size:18px;color:#0d6efd"><strong>${etapa}</strong></p>
    <p>Você pode acompanhar os detalhes no portal:</p>
    <p style="margin:24px 0">
      <a href="${safeLink}" style="background:#0d6efd;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold" target="_blank">Acessar Minhas Candidaturas</a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="color:#666;font-size:12px">Se você não esperava este email, ignore-o com segurança.<br>Este é um email automático, por favor não responda.</p>
  </div>`;
  return { subject, text, html };
}

async function sendStageUpdateEmail({ email, nome, vaga, etapa, link }) {
  const { subject, text, html } = buildStageUpdateTemplate({ nome, vaga, etapa, link });
  return sendMail({ to: email, subject, text, html });
}

function buildRejectionTemplate({ nome, vaga, link }) {
  const appUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const safeLink = link || `${appUrl}/inicio`;
  const subject = `Atualização do processo seletivo (${vaga})`;
  const text = `Olá ${nome},

Agradecemos pelo seu interesse na vaga "${vaga}". 
Após análise, informamos que sua candidatura não seguirá para as próximas etapas.

Acompanhe seu cadastro e outras oportunidades em: ${safeLink}

Agradecemos pela participação e desejamos sucesso em suas próximas buscas.

Atenciosamente,
Equipe de RH`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto">
    <h2 style="color:#111">Atualização do processo seletivo</h2>
    <p>Olá <strong>${nome}</strong>,</p>
    <p>Agradecemos pelo seu interesse na vaga <strong>${vaga}</strong></p>
    <p>Após análise, informamos que sua candidatura não seguirá para as próximas etapas.</p>
    <p>Agradecemos pela participação e desejamos sucesso em suas próximas buscas.</p>
    <p style="margin:24px 0">
      <a href="${safeLink}" style="background:#0d6efd;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold" target="_blank">Acessar Minhas Candidaturas</a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="color:#666;font-size:12px">Se você não esperava este email, ignore-o com segurança.<br>Este é um email automático, por favor não responda.</p>
  </div>`;
  return { subject, text, html };
}

async function sendRejectionEmail({ email, nome, vaga, link }) {
  const { subject, text, html } = buildRejectionTemplate({ nome, vaga, link });
  return sendMail({ to: email, subject, text, html });
}


module.exports = {
  sendMail,
  sendStageUpdateEmail,
  sendRejectionEmail
};