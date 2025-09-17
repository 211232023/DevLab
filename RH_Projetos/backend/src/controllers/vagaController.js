const path = require('path');
const pool = require(path.resolve(__dirname, '../config/db'));

// Criar uma nova vaga
exports.createVaga = async (req, res) => {
  try {
    const {
      rh_id,
      titulo,
      area,
      salario,
      descricao,
      requisitos,
      manual,
      escala_trabalho,
      data_fechamento
    } = req.body;

    // Validação básica
    if (!rh_id || !titulo || !area) {
      return res.status(400).json({ error: 'Campos rh_id, titulo e área são obrigatórios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO vagas (rh_id, titulo, area, salario, descricao, requisitos, manual, escala_trabalho, data_fechamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [rh_id, titulo, area, salario, descricao, requisitos, manual, escala_trabalho, data_fechamento]
    );

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    console.error("Erro ao criar vaga:", err);
    res.status(500).json({ error: 'Erro ao criar vaga' });
  }
};

// Buscar todas as vagas
exports.getAllVagas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vagas ORDER BY data_abertura DESC');
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar vagas:", err);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
};

// Buscar uma vaga pelo ID
exports.getVagaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM vagas WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar vaga:", err);
    res.status(500).json({ error: 'Erro ao buscar vaga' });
  }
};

// Atualizar uma vaga
exports.updateVaga = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      area,
      salario,
      descricao,
      requisitos,
      manual,
      escala_trabalho,
      data_fechamento
    } = req.body;
    
    await pool.query(
      'UPDATE vagas SET titulo = ?, area = ?, salario = ?, descricao = ?, requisitos = ?, manual = ?, escala_trabalho = ?, data_fechamento = ? WHERE id = ?',
      [titulo, area, salario, descricao, requisitos, manual, escala_trabalho, data_fechamento, id]
    );

    res.json({ id: parseInt(id, 10), ...req.body });
  } catch (err) {
    console.error("Erro ao atualizar vaga:", err);
    res.status(500).json({ error: 'Erro ao atualizar vaga' });
  }
};

// Deletar uma vaga
exports.deleteVaga = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM vagas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }
    res.json({ message: 'Vaga removida com sucesso' });
  } catch (err) {
    console.error("Erro ao remover vaga:", err);
    res.status(500).json({ error: 'Erro ao remover vaga' });
  }
};