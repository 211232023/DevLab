const express = require('express');
const cors = require('cors');
const candidatoRoutes = require('./routes/candidatoRoutes');
const vagaRoutes = require('./routes/vagaRoutes');
const authRoutes = require('./routes/authRoutes'); // Adicione esta linha

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/candidatos', candidatoRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api', authRoutes); // Adicione esta linha para usar as rotas de autenticação

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});