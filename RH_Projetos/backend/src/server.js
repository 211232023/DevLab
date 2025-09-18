const express = require('express');
const cors = require('cors');
const vagaRoutes = require('./routes/vagaRoutes');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const candidaturaRoutes = require('./routes/candidaturaRoute');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(fileUpload()); // <-- Mova esta linha para cá
app.use(express.static('public')); 

// --- ORGANIZANDO AS ROTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/candidaturas', candidaturaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});