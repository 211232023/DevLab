const pool = require('../config/db');

exports.getAllCandidatos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, cpf, email, data_cadastro FROM candidatos');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar candidatos' });
  }
};
