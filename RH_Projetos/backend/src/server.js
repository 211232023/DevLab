const express = require('express');
const cors = require('cors');
const vagaRoutes = require('./routes/vagaRoutes');
const authRoutes = require('./routes/authRoutes');

const usuarioRoutes = require('./routes/usuarioRoutes'); 
const inscricaoRoutes = require('./routes/inscricaoRoutes'); 
const candidaturaRoutes = require('./routes/candidaturaRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/usuarios', usuarioRoutes); 
app.use('/api/inscricoes', inscricaoRoutes); 
app.use('/api/candidaturas', candidaturaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});