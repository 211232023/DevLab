const db = require('../config/db');
const path = require('path');

exports.inscreverCandidato = async (req, res) => {
  try {
    const { vaga_id } = req.params;
    const candidato_id = req.user.id;
    const { endereco } = req.body;

    if (!req.files || !req.files.curriculo) {
      return res.status(400).json({ error: 'O anexo do currículo é obrigatório.' });
    }
    const curriculoFile = req.files.curriculo;

    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads');
    const curriculoNome = `${candidato_id}-${vaga_id}-${Date.now()}-${curriculoFile.name}`;
    const curriculoPath = path.join(uploadPath, curriculoNome);

    await curriculoFile.mv(curriculoPath);

    // ALTERAÇÃO AQUI: Mudamos 'Enviado' para 'Aguardando Teste'
    const [result] = await db.query(
      'INSERT INTO candidaturas (candidato_id, vaga_id, curriculo, status, endereco) VALUES (?, ?, ?, ?, ?)',
      [candidato_id, vaga_id, `/uploads/${curriculoNome}`, 'Aguardando Teste', endereco]
    );

    res.status(201).json({ id: result.insertId, message: 'Inscrição realizada com sucesso!' });

  } catch (error) {
    console.error('Erro ao inscrever candidato:', error);
    res.status(500).json({ error: 'Erro no servidor ao realizar inscrição.', details: error.message });
  }
};

// Listar todas as candidaturas de um candidato específico
exports.listarCandidaturasPorCandidato = async (req, res) => {
  const { candidato_id } = req.params;

  try {
    const [candidaturas] = await db.query(
      `SELECT 
         c.id, c.vaga_id, c.data_inscricao, c.status, 
         v.titulo as nome_vaga, v.area, v.descricao 
       FROM candidaturas c
       JOIN vagas v ON c.vaga_id = v.id
       WHERE c.candidato_id = ?`,
      [candidato_id]
    );

    if (candidaturas.length === 0) {
      return res.status(200).json([]); // Retorna array vazio em vez de 404
    }

    res.status(200).json(candidaturas);
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar as candidaturas.' });
  }
};

// Desistir de uma candidatura
exports.desistirDeVaga = async (req, res) => {
  const { candidatura_id } = req.params;

  if (!candidatura_id) {
    return res.status(400).json({ message: 'O ID da candidatura é obrigatório.' });
  }

  try {
    const [result] = await db.query('DELETE FROM candidaturas WHERE id = ?', [candidatura_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Candidatura não encontrada.' });
    }

    res.status(200).json({ message: 'Você desistiu da vaga com sucesso.' });
  } catch (error) {
    console.error('Erro ao desistir da vaga:', error);
    res.status(500).json({ message: 'Erro no servidor ao tentar desistir da vaga.' });
  }
};

// Listar todos os candidatos de uma vaga específica
exports.listarCandidatosPorVaga = async (req, res) => {
  const { vaga_id } = req.params;

  if (!vaga_id) {
    return res.status(400).json({ message: 'O ID da vaga é obrigatório.' });
  }

  try {
    const [candidatos] = await db.query(
      `SELECT
          c.id, c.candidato_id, c.status, c.endereco,
          u.nome as nome_candidato, u.email as email_candidato,
          u.telefone,
          c.curriculo
        FROM candidaturas c
        JOIN usuarios u ON c.candidato_id = u.id
        WHERE c.vaga_id = ?`,
      [vaga_id]
    );

    if (candidatos.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(candidatos);
  } catch (error) {
    console.error('Erro ao buscar candidatos da vaga:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar os candidatos da vaga.' });
  }
};

// Atualizar o status de uma candidatura
exports.updateStatusCandidatura = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validação para garantir que o status enviado é válido
  const statusPermitidos = ['Aguardando Teste', 'Teste Disponível', 'Manual', 'Envio de Documentos', 'Entrevista', 'Finalizado'];
  if (!status || !statusPermitidos.includes(status)) {
    return res.status(400).json({ message: 'Status inválido fornecido.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE candidaturas SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Candidatura não encontrada.' });
    }

    res.status(200).json({ message: 'Status da candidatura atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar status da candidatura:', error);
    res.status(500).json({ message: 'Erro no servidor ao tentar atualizar o status.' });
  }
};

// Deletar uma candidatura (pelo RH/Admin)
exports.deleteCandidatura = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM candidaturas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Candidatura não encontrada.' });
    }

    res.status(200).json({ message: 'Candidatura eliminada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar candidatura:', error);
    res.status(500).json({ message: 'Erro no servidor ao tentar eliminar a candidatura.' });
  }
};

// Adicione esta função em src/controllers/candidaturaController.js

exports.getCandidaturaById = async (req, res) => {
  const { id } = req.params;
  try {
    const [candidaturas] = await db.query(
      'SELECT * FROM candidaturas WHERE id = ?', 
      [id]
    );

    if (candidaturas.length === 0) {
      return res.status(404).json({ message: 'Candidatura não encontrada.' });
    }

    res.status(200).json(candidaturas[0]);
  } catch (error) {
    console.error('Erro ao buscar candidatura:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar os dados da candidatura.' });
  }
};

exports.listarMinhasCandidaturas = async (req, res) => {
  // O ID do candidato vem do token JWT, injetado pelo middleware 'protect'
  const candidato_id = req.user.id;

  try {
    const [candidaturas] = await db.query(
      `SELECT
          c.id, c.vaga_id, c.data_inscricao, c.status,
          v.titulo as nome_vaga, v.area, v.descricao
        FROM candidaturas c
        JOIN vagas v ON c.vaga_id = v.id
        WHERE c.candidato_id = ?
        ORDER BY c.data_inscricao DESC`,
      [candidato_id]
    );
    
    res.status(200).json(candidaturas);

  } catch (error) {
    console.error('Erro ao buscar as minhas candidaturas:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar as candidaturas.' });
  }
};