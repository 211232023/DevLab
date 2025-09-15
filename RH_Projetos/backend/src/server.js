const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const vagaRoutes = require('./routes/vagaRoutes');
const candidatoRoutes = require('./routes/candidatoRoutes');
const testeRoutes = require('./routes/testeRoutes'); // Importe a nova rota de testes

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', authRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/candidatos', candidatoRoutes);
app.use('/api/testes', testeRoutes); // Use a nova rota de testes

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});