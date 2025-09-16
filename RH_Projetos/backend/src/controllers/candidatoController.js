const pool = require('../config/db');
const bcrypt = require('bcrypt');

// CREATE
exports.createCandidato = async (req, res) => {
  try {
    const { nome, cpf, email, telefone, genero, senha } = req.body;
    
    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      'INSERT INTO candidatos (nome, cpf, email, telefone, genero, senha, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nome, cpf, email, telefone, genero, hashedPassword]
    );
    res.status(201).json({ id: result.insertId, nome, cpf, email, telefone, genero });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar candidato' });
  }
};

// READ ALL
exports.getAllCandidatos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM candidatos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar candidatos' });
  }
};

// READ ONE
exports.getCandidatoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM candidatos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Candidato não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar candidato' });
  }
};

// UPDATE
exports.updateCandidato = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, email, genero, telefone } = req.body;
    const [result] = await pool.query(
      'UPDATE candidatos SET nome = ?, cpf = ?, email = ?, genero = ?, telefone = ? WHERE id = ?',
      [nome, cpf, email, genero, telefone, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Candidato não encontrado' });
    res.json({ id, nome, cpf, email, genero, telefone });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar candidato' });
  }
};

// DELETE
exports.deleteCandidato = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM candidatos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Candidato não encontrado' });
    res.json({ message: 'Candidato removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover candidato' });
  }
};