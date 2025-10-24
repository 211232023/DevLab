const express = require("express");
const router = express.Router();
const { sendStageUpdateEmail } = require("../../nodemailer");

router.post("/test-email", async (req, res) => {
  try {
    await sendStageUpdateEmail({
      email: "201622023@eniac.edu.br", // seu email para teste
      nome: "João Silva",
      vaga: "Desenvolvedor Full Stack",
      etapa: "Entrevista Técnica",
      link: "http://localhost:3001/minhas-candidaturas/123",
    });

    res.json({ success: true, message: "Email enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;