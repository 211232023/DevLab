const express = require('express');
const cors = require('cors');
const candidatoRoutes = require('./routes/candidatoRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/candidatos', candidatoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
