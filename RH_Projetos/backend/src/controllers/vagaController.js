const db = require('../config/db');

// --- FUNÇÃO DE CRIAR VAGA ATUALIZADA ---
exports.createVaga = async (req, res) => {
    const { 
        rh_id, titulo, area, salario, descricao, 
        data_Abertura, data_fechamento, escala_trabalho, beneficios 
    } = req.body;

    if (!rh_id || !titulo || !area || !salario || !descricao || !data_Abertura || !data_fechamento || !escala_trabalho) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const query = `
        INSERT INTO vagas (
            rh_id, titulo, area, salario, descricao, 
            data_Abertura, data_fechamento, escala_trabalho, beneficios
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        rh_id, titulo, area, salario, descricao, 
        data_Abertura, data_fechamento, escala_trabalho, beneficios
    ];

    let connection;
    try {
        // Pega uma conexão do pool
        connection = await db.getConnection(); 
        const [result] = await connection.query(query, values);
        res.status(201).json({ message: 'Vaga criada com sucesso!', vagaId: result.insertId });
    } catch (err) {
        console.error('Erro ao criar vaga:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.' });
    } finally {
        // Libera a conexão de volta para o pool, estando ela com erro ou não
        if (connection) connection.release(); 
    }
};

// --- DEMAIS FUNÇÕES ATUALIZADAS PARA USAR ASYNC/AWAIT ---

exports.getAllVagas = async (req, res) => {
    const query = 'SELECT * FROM vagas';
    let connection;
    try {
        connection = await db.getConnection();
        const [results] = await connection.query(query);
        res.json(results);
    } catch (err) {
        console.error('Erro ao obter vagas:', err);
        res.status(500).send('Erro ao obter vagas');
    } finally {
        if (connection) connection.release();
    }
};

exports.getVagaById = async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM vagas WHERE id = ?';
    let connection;
    try {
        connection = await db.getConnection();
        const [results] = await connection.query(query, [id]);
        if (results.length === 0) {
            return res.status(404).send('Vaga não encontrada');
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Erro ao obter vaga:', err);
        res.status(500).send('Erro ao obter vaga');
    } finally {
        if (connection) connection.release();
    }
};

exports.updateVaga = async (req, res) => {
    const { id } = req.params;
    const { titulo, area, salario, descricao, data_Abertura, data_fechamento, escala_trabalho, beneficios } = req.body;
    const query = `
        UPDATE vagas SET titulo = ?, area = ?, salario = ?, descricao = ?, 
        data_Abertura = ?, data_fechamento = ?, escala_trabalho = ?, beneficios = ?
        WHERE id = ?
    `;
    const values = [titulo, area, salario, descricao, data_Abertura, data_fechamento, escala_trabalho, beneficios, id];

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(query, values);
        if (result.affectedRows === 0) {
            return res.status(404).send('Vaga não encontrada para atualização');
        }
        res.send('Vaga atualizada com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar vaga:', err);
        res.status(500).send('Erro ao atualizar vaga');
    } finally {
        if (connection) connection.release();
    }
};

exports.deleteVaga = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM vagas WHERE id = ?';
    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Vaga não encontrada para deletar');
        }
        res.send('Vaga deletada com sucesso');
    } catch (err) {
        console.error('Erro ao deletar vaga:', err);
        res.status(500).send('Erro ao deletar vaga');
    } finally {
        if (connection) connection.release();
    }
};

exports.listarCandidatosPorVaga = async (req, res) => {
  const { vaga_id } = req.params;

  try {
    const [candidatos] = await db.query(
      `SELECT 
         u.nome, u.email, u.telefone,
         c.id as candidatura_id, c.status, u.curriculo_path as curriculo 
       FROM candidaturas c
       JOIN usuarios u ON c.candidato_id = u.id
       WHERE c.vaga_id = ?`,
      [vaga_id]
    );

    if (candidatos.length === 0) {
      // É normal uma vaga não ter candidatos ainda, então retornamos um array vazio.
      return res.status(200).json([]);
    }

    res.status(200).json(candidatos);
  } catch (error) {
    console.error('Erro ao buscar candidatos da vaga:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar os candidatos.' });
  }
};

// Listar todas as vagas de um recrutador com seus respectivos candidatos
exports.listarVagasComCandidatos = async (req, res) => {
  const { recrutador_id } = req.params;

  if (!recrutador_id) {
    return res.status(400).json({ message: 'O ID do recrutador é obrigatório.' });
  }

  let connection;
  try {
    // Pega uma conexão do pool
    connection = await db.getConnection();

    // 1. Pega todas as vagas do recrutador
    const [vagas] = await connection.query('SELECT * FROM vagas WHERE rh_id = ?', [recrutador_id]);

    if (vagas.length === 0) {
      // Se não houver vagas, retorna um array vazio.
      return res.status(200).json([]);
    }

    // 2. Para cada vaga, busca os candidatos de forma sequencial
    const vagasComCandidatos = [];
    for (const vaga of vagas) {
      const [candidatos] = await connection.query(
        `SELECT
           u.nome, u.email, u.telefone,
           c.id as candidatura_id, c.status, u.curriculo_path as curriculo
         FROM candidaturas c
         JOIN usuarios u ON c.candidato_id = u.id
         WHERE c.vaga_id = ?`,
        [vaga.id]
      );
      vagasComCandidatos.push({ ...vaga, candidatos });
    }

    res.status(200).json(vagasComCandidatos);
  } catch (error) {
    console.error('Erro ao buscar vagas com candidatos:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar os dados de gestão.' });
  } finally {
    // Libera a conexão de volta para o pool
    if (connection) connection.release();
  }
};

// Listar todas as vagas de um usuário específico
exports.listarVagasPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  if (!usuario_id) {
    return res.status(400).json({ message: 'O ID do usuário é obrigatório.' });
  }

  try {
    // Adicionada a cláusula "WHERE v.usuario_id = ?" para filtrar as vagas
    const [vagas] = await db.query(
      'SELECT v.*, u.nome as nome_usuario FROM vagas v JOIN usuarios u ON v.usuario_id = u.id WHERE v.usuario_id = ?',
      [usuario_id]
    );

    if (vagas.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(vagas);
  } catch (error) {
    console.error('Erro ao buscar vagas por usuário:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar as vagas.' });
  }
};
