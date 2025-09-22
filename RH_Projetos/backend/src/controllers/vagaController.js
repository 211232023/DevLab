const db = require('../config/db');

// --- FUNÇÃO PARA CRIAR APENAS A VAGA ---
exports.createVaga = async (req, res) => {
    const { titulo, area, salario, descricao, data_Abertura, data_fechamento, escala_trabalho, beneficios, rh_id } = req.body;
    const vagaData = { titulo, area, salario, descricao, data_Abertura, data_fechamento, escala_trabalho, beneficios, rh_id };

    if (!titulo || !descricao || !rh_id) {
        return res.status(400).json({ error: 'Título, descrição e rh_id são obrigatórios.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query('INSERT INTO vagas SET ?', [vagaData]);
        res.status(201).json({ message: 'Vaga criada com sucesso!', vagaId: result.insertId });
    } catch (err) {
        console.error('Erro ao criar vaga:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.' });
    } finally {
        if (connection) connection.release();
    }
};



exports.createVagaCompleta = async (req, res) => {
    console.log('--- INICIANDO CRIAÇÃO DE VAGA COMPLETA ---');
    const { vagaData, testeData, questoes } = req.body;

    // --- PONTO DE INVESTIGAÇÃO 1: Verificar dados recebidos ---
    console.log('Dados recebidos no corpo da requisição:', JSON.stringify(req.body, null, 2));

    // Validação de dados de entrada
    if (!vagaData || !testeData || !questoes) {
        console.error('ERRO: Dados de entrada ausentes ou inválidos.');
        return res.status(400).json({ error: 'Dados da vaga, teste e questões são obrigatórios.' });
    }

    // --- ALTERAÇÃO: Adicionada validação para o título do teste ---
    if (!testeData.titulo || testeData.titulo.trim() === '') {
        console.error('ERRO: O título do teste é obrigatório.');
        return res.status(400).json({ error: 'O título do teste é obrigatório.' });
    }
    
    if (questoes.length === 0) {
        console.error('ERRO: Pelo menos uma questão é necessária.');
        return res.status(400).json({ error: 'O teste deve ter pelo menos uma questão.' });
    }


    let connection; // Declarar a conexão aqui para que seja acessível no finally
    try {
        console.log('Tentando obter conexão com o banco de dados...');
        connection = await db.getConnection();
        console.log('Conexão com o banco de dados obtida com sucesso.');

        console.log('Iniciando transação...');
        await connection.beginTransaction();
        console.log('Transação iniciada.');

        // 1. Criar a Vaga
        console.log('1. Inserindo vaga na tabela "vagas"...');
        const [vagaResult] = await connection.query('INSERT INTO vagas SET ?', [vagaData]);
        const vagaId = vagaResult.insertId;
        console.log(`Vaga inserida com sucesso! ID da Vaga: ${vagaId}`);

        // 2. Criar o Teste
        console.log('2. Inserindo teste na tabela "testes"...');
        const testeParaSalvar = { ...testeData, vaga_id: vagaId };
        const [testeResult] = await connection.query('INSERT INTO testes SET ?', [testeParaSalvar]);
        const testeId = testeResult.insertId;
        console.log(`Teste inserido com sucesso! ID do Teste: ${testeId}`);

        // 3. Criar as Questões e Alternativas
        console.log('3. Iniciando loop para inserir questões e alternativas...');
        for (const [index, questao] of questoes.entries()) {
            const { enunciado, area_conhecimento, alternativas } = questao;
            console.log(`  - Processando Questão #${index + 1}: "${enunciado}"`);
            
            const [questaoResult] = await connection.query(
                'INSERT INTO questoes (enunciado, area_conhecimento) VALUES (?, ?)',
                [enunciado, area_conhecimento]
            );
            const questaoId = questaoResult.insertId;
            console.log(`    - Questão inserida com sucesso! ID da Questão: ${questaoId}`);

            console.log(`    - Associando questão ${questaoId} ao teste ${testeId}...`);
            await connection.query(
                'INSERT INTO testes_questoes (teste_id, questao_id) VALUES (?, ?)',
                [testeId, questaoId]
            );
            console.log(`    - Associação com o teste criada.`);

            if (alternativas && alternativas.length > 0) {
                console.log(`    - Inserindo ${alternativas.length} alternativas para a questão ${questaoId}...`);
                const alternativasValues = alternativas.map(alt => [questaoId, alt.texto, alt.correta ? 1 : 0]); // Garante que booleano vire 0 ou 1
                await connection.query(
                    'INSERT INTO alternativas (questao_id, texto, correta) VALUES ?',
                    [alternativasValues]
                );
                console.log(`    - Alternativas inseridas com sucesso.`);
            }
        }
        console.log('Loop de questões finalizado.');

        console.log('Fazendo commit da transação...');
        await connection.commit();
        console.log('Commit realizado com sucesso!');

        res.status(201).json({ message: 'Vaga e teste criados com sucesso!', vagaId: vagaId });
        console.log('--- FINALIZADO COM SUCESSO ---');

    } catch (err) {
        console.error('!!! ERRO DURANTE A TRANSAÇÃO !!!');
        console.error('O erro foi:', err);

        if (connection) {
            console.log('Fazendo rollback da transação...');
            await connection.rollback();
            console.log('Rollback realizado.');
        }
        
        res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.', details: err.message });
        console.log('--- FINALIZADO COM ERRO ---');
    } finally {
        if (connection) {
            console.log('Liberando a conexão com o banco de dados.');
            connection.release();
        }
    }
};

// --- DEMAIS FUNÇÕES DO CONTROLLER ---

exports.getAllVagas = async (req, res) => {
    // Consulta explícita com alias para garantir os nomes corretos
    const query = `
        SELECT 
            id,
            titulo,
            area,
            salario,
            descricao,
            data_Abertura,
            data_fechamento,
            escala_trabalho,
            beneficios,
            rh_id 
        FROM vagas
    `;
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
         u.nome as nome_candidato,
         u.email as email_candidato,
         u.telefone,
         c.id as candidatura_id, 
         c.status, 
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
    res.status(500).json({ message: 'Erro no servidor ao buscar os candidatos.' });
  }
};

exports.listarVagasComCandidatos = async (req, res) => {
  const { recrutador_id } = req.params;

  if (!recrutador_id) {
    return res.status(400).json({ message: 'O ID do recrutador é obrigatório.' });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [vagas] = await connection.query('SELECT * FROM vagas WHERE rh_id = ?', [recrutador_id]);

    if (vagas.length === 0) {
      return res.status(200).json([]);
    }

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