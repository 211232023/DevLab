const db = require('../config/db');

// Inscrever um candidato em uma vaga
exports.inscreverCandidato = async (req, res) => {
  const { vaga_id } = req.params;
  const { candidato_id } = req.body; 

  if (!candidato_id || !vaga_id) {
    return res.status(400).json({ message: 'ID do candidato e da vaga são obrigatórios.' });
  }

  try {
    const [jaInscrito] = await db.query(
      'SELECT * FROM candidaturas WHERE candidato_id = ? AND vaga_id = ?',
      [candidato_id, vaga_id]
    );

    if (jaInscrito.length > 0) {
      return res.status(409).json({ message: 'Você já se candidatou para esta vaga.' });
    }

    const novaCandidatura = {
      candidato_id,
      vaga_id,
      data_inscricao: new Date(),
      status: 'Aguardando Teste', // CORRIGIDO: Status inicial correto
    };

    const [result] = await db.query('INSERT INTO candidaturas SET ?', novaCandidatura);

    res.status(201).json({ id: result.insertId, ...novaCandidatura });
  } catch (error) {
    console.error('Erro ao se inscrever na vaga:', error);
    res.status(500).json({ message: 'Erro no servidor ao tentar realizar a inscrição.' });
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