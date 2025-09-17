const express = require('express');
const cors = require('cors');
const vagaRoutes = require('./routes/vagaRoutes');
const candidatoRoutes = require('./routes/candidatoRoutes');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes'); // 1. Adicione esta linha

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/vagas', vagaRoutes);
app.use('/api/candidatos', candidatoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes); // 2. Adicione esta linha

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});