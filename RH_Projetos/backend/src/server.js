// src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');

// Importe as rotas
const authRoutes = require('./routes/authRoutes');
const vagaRoutes = require('./routes/vagaRoutes');
const candidaturaRoutes = require('./routes/candidaturaRoute');
const usuarioRoutes = require('./routes/usuarioRoutes');
const questaoRoutes = require('./routes/questaoRoutes');
const testeRoutes = require('./routes/testeRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Use as rotas
app.use('/api/auth', authRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/candidaturas', candidaturaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/questoes', questaoRoutes);
app.use('/api/testes', testeRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});