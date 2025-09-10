const pool = require('../config/db');

// CREATE
exports.createVaga = async (req, res) => {
  try {
    const { titulo, descricao, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO vagas (titulo, descricao, status, data_abertura) VALUES (?, ?, ?, NOW())',
      [titulo, descricao, status || 'aberta']
    );
    res.status(201).json({ id: result.insertId, titulo, descricao, status: status || 'aberta' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar vaga' });
  }
};

// READ ALL
exports.getAllVagas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vagas');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
};

// READ ONE
exports.getVagaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM vagas WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Vaga não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vaga' });
  }
};

// UPDATE
exports.updateVaga = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, status } = req.body;
    const [result] = await pool.query(
      'UPDATE vagas SET titulo = ?, descricao = ?, status = ? WHERE id = ?',
      [titulo, descricao, status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vaga não encontrada' });
    res.json({ id, titulo, descricao, status });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar vaga' });
  }
};

// DELETE
exports.deleteVaga = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM vagas WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vaga não encontrada' });
    res.json({ message: 'Vaga removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover vaga' });
  }
};
