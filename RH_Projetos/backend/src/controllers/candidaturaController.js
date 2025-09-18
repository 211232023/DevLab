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
  // A linha mais importante: pegando o vaga_id dos parâmetros da rota
  const { vaga_id } = req.params;

  // Verificação para garantir que vaga_id não seja undefined
  if (!vaga_id) {
    return res.status(400).json({ message: 'O ID da vaga é obrigatório.' });
  }

  try {
    const [candidatos] = await db.query(
      `SELECT
         c.id, c.candidato_id, c.status, c.endereco,
         u.nome as nome_candidato, u.email as email_candidato,
         c.curriculo
       FROM candidaturas c
       JOIN usuarios u ON c.candidato_id = u.id
       WHERE c.vaga_id = ?`,
      [vaga_id] // Passando o vaga_id para a query
    );

    // O restante do seu código permanece o mesmo
    if (candidatos.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(candidatos);
  } catch (error) {
    console.error('Erro ao buscar candidatos da vaga:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar os candidatos da vaga.' });
  }
};
