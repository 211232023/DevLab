require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const vagaRoutes = require('./routes/vagaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const candidaturaRoutes = require('./routes/candidaturaRoute');
const authRoutes = require('./routes/authRoutes');
const testeRoutes = require('./routes/testeRoutes');
const questaoRoutes = require('./routes/questaoRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Nova requisição: ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/candidaturas', candidaturaRoutes);
app.use('/api/testes', testeRoutes);
app.use('/api/questoes', questaoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});