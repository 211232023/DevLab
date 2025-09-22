require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importação das rotas
const vagaRoutes = require('./routes/vagaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const candidaturaRoutes = require('./routes/candidaturaRoute');
const authRoutes = require('./routes/authRoutes');
const testeRoutes = require('./routes/testeRoutes');
const questaoRoutes = require('./routes/questaoRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURAÇÃO DE MIDDLEWARES ---

// 1. CORS: Deve vir primeiro para lidar com requisições de origens diferentes.
app.use(cors());

// 2. Body Parser: Essencial para que o Express entenda o corpo da requisição em JSON.
// Esta linha é crucial e deve vir antes das rotas.
app.use(express.json());

// 3. Servir arquivos estáticos (como currículos)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// --- LOG DE DIAGNÓSTICO ---
// Adicione este middleware para ver TODAS as requisições que chegam.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Nova requisição: ${req.method} ${req.url}`);
  next(); // Continua para a próxima rota
});


// --- ROTAS DA APLICAÇÃO ---
app.use('/api/auth', authRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/candidaturas', candidaturaRoutes);
app.use('/api/testes', testeRoutes);
app.use('/api/questoes', questaoRoutes);


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});