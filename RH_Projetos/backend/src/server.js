const express = require('express');
const cors = require('cors');
const vagaRoutes = require('./routes/vagaRoutes');
const authRoutes = require('./routes/authRoutes');

// --- NOSSAS MUDANÇAS ---
const usuarioRoutes = require('./routes/usuarioRoutes'); // 1. Importa as novas rotas de usuário
const inscricaoRoutes = require('./routes/inscricaoRoutes'); // 2. Importa as rotas de inscrição corrigidas

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ORGANIZANDO AS ROTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/usuarios', usuarioRoutes); // 3. USA a rota de usuários
app.use('/api/inscricoes', inscricaoRoutes); // 4. USA a rota de inscrições com um nome mais claro

// Rota de candidatos foi removida/substituída, então a linha abaixo pode ser apagada:
// app.use('/api/candidatos', candidatoRoutes); 

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});