const db = require('../config/db');

// --- FUNÇÃO DE CRIAR VAGA ATUALIZADA ---
// Em src/controllers/vagaController.js

exports.createVagaCompleta = async (req, res) => {
    const { vagaData, testeData, questoes } = req.body;

    if (!vagaData || !testeData || !questoes || questoes.length === 0) {
        return res.status(400).json({ error: 'Dados da vaga, teste e pelo menos uma questão são obrigatórios.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Criar a Vaga
        const [vagaResult] = await connection.query('INSERT INTO vagas SET ?', [vagaData]);
        const vagaId = vagaResult.insertId;

        // 2. Criar o Teste
        const testeParaSalvar = { ...testeData, vaga_id: vagaId };
        const [testeResult] = await connection.query('INSERT INTO testes SET ?', [testeParaSalvar]);
        const testeId = testeResult.insertId;

        // 3. Criar as Questões, Alternativas e associar ao teste
        for (const questao of questoes) {
            const { enunciado, area_conhecimento, alternativas } = questao;
            
            const [questaoResult] = await connection.query(
                'INSERT INTO questoes (enunciado, area_conhecimento) VALUES (?, ?)',
                [enunciado, area_conhecimento]
            );
            const questaoId = questaoResult.insertId;

            // --- LINHA ADICIONADA: Associa a questão criada ao teste ---
            await connection.query(
                'INSERT INTO testes_questoes (teste_id, questao_id) VALUES (?, ?)',
                [testeId, questaoId]
            );

            // Insere as alternativas da questão
            if (alternativas && alternativas.length > 0) {
                const alternativasValues = alternativas.map(alt => [questaoId, alt.texto, alt.correta]);
                await connection.query(
                    'INSERT INTO alternativas (questao_id, texto, correta) VALUES ?',
                    [alternativasValues]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Vaga e teste criados com sucesso!', vagaId: vagaId });

    } catch (err) {
        await connection.rollback();
        console.error('Erro ao criar vaga completa:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.' });
    } finally {
        connection.release();
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
         u.nome as nome_candidato, -- Adicionando alias para clareza
         u.email as email_candidato, -- Adicionando alias
         u.telefone,
         c.id as candidatura_id, 
         c.status, 
         c.curriculo -- <--- CORREÇÃO AQUI
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
           c.id as candidatura_id, c.status, c.curriculo as curriculo
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

exports.listarVagasPorUsuario = async (req, res) => {
    const { usuario_id } = req.params;

    if (!usuario_id) {
        return res.status(400).json({ message: 'O ID do usuário é obrigatório.' });
    }

    let connection;
    try {
        connection = await db.getConnection();

        const [vagas] = await connection.query('SELECT * FROM vagas WHERE rh_id = ?', [usuario_id]);

        if (vagas.length === 0) {
            return res.status(200).json([]);
        }

        const vagasComCandidatos = await Promise.all(
            vagas.map(async (vaga) => {
                const [candidatos] = await connection.query(
                    `SELECT
                       u.nome as nome_candidato, u.email as email_candidato, u.telefone, c.curriculo as curriculo,
                       c.id as candidatura_id, c.status
                     FROM candidaturas c
                     JOIN usuarios u ON c.candidato_id = u.id
                     WHERE c.vaga_id = ?`,
                    [vaga.id]
                );
                return { ...vaga, candidatos };
            })
        );

        res.status(200).json(vagasComCandidatos);
    } catch (error) {
        console.error('Erro ao buscar vagas por usuário:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar as vagas.' });
    } finally {
        if (connection) connection.release();
    }
};

exports.createVagaCompleta = async (req, res) => {
    const { vagaData, testeData, questoes } = req.body;

    // Validação básica
    if (!vagaData || !testeData || !questoes || questoes.length === 0) {
        return res.status(400).json({ error: 'Dados da vaga, teste e pelo menos uma questão são obrigatórios.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Criar a Vaga
        const [vagaResult] = await connection.query('INSERT INTO vagas SET ?', [vagaData]);
        const vagaId = vagaResult.insertId;

        // 2. Criar o Teste
        const testeParaSalvar = { ...testeData, vaga_id: vagaId };
        const [testeResult] = await connection.query('INSERT INTO testes SET ?', [testeParaSalvar]);
        const testeId = testeResult.insertId;

        // 3. Criar as Questões e Alternativas
        for (const questao of questoes) {
            const { enunciado, area_conhecimento, alternativas } = questao;
            
            const [questaoResult] = await connection.query(
                'INSERT INTO questoes (enunciado, area_conhecimento) VALUES (?, ?)',
                [enunciado, area_conhecimento]
            );
            const questaoId = questaoResult.insertId;

            const alternativasValues = alternativas.map(alt => [questaoId, alt.texto, alt.correta]);
            await connection.query(
                'INSERT INTO alternativas (questao_id, texto, correta) VALUES ?',
                [alternativasValues]
            );
        }

        // Se tudo deu certo, confirma as operações
        await connection.commit();
        res.status(201).json({ message: 'Vaga e teste criados com sucesso!', vagaId: vagaId });

    } catch (err) {
        // Se algo deu errado, desfaz tudo
        await connection.rollback();
        console.error('Erro ao criar vaga completa:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.' });
    } finally {
        connection.release();
    }
};