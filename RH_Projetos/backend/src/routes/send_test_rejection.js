require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

const { sendRejectionEmail } = require('../../nodemailer');

const TEST_EMAIL = process.env.TEST_REJECTION_EMAIL || 'walter.ara.souza@hotmail.com';
const TEST_NAME = process.env.TEST_REJECTION_NAME || 'Candidato Teste';
const TEST_VAGA = process.env.TEST_REJECTION_VAGA || 'Vaga de Exemplo';
const TEST_LINK = process.env.TEST_REJECTION_LINK || `${process.env.APP_BASE_URL || 'http://localhost:3000'}/minhas-candidaturas`;

(async () => {
  try {
    console.log('SMTP_HOST:', process.env.SMTP_HOST); // debug rápido
    console.log('Enviando email de rejeição de teste para', TEST_EMAIL);
    await sendRejectionEmail({
      email: TEST_EMAIL,
      nome: TEST_NAME,
      vaga: TEST_VAGA,
      link: TEST_LINK
    });
    console.log('Email de teste enviado com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('Falha ao enviar email de teste:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();