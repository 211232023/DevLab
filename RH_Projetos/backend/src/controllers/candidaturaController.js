const db = require('../config/db');
const path = require('path');

exports.inscreverCandidato = async (req, res) => {
  try {
    const { vaga_id } = req.params;
    const candidato_id = req.user.id;
    const { endereco } = req.body;

    // --- ADICIONE ESTA VERIFICAÇÃO AQUI ---
    const [existente] = await db.query(
      'SELECT id FROM candidaturas WHERE candidato_id = ? AND vaga_id = ?',
      [candidato_id, vaga_id]
    );

    if (existente.length > 0) {
      return res.status(409).json({ error: 'Você já se candidatou para esta vaga.' });
    }
    // --- FIM DA VERIFICAÇÃO ---

    if (!req.files || !req.files.curriculo) {
      return res.status(400).json({ error: 'O anexo do currículo é obrigatório.' });
    }
    const curriculoFile = req.files.curriculo;

    const curriculoNome = `${candidato_id}-${vaga_id}-${Date.now()}-${curriculoFile.name}`;
    const curriculoPath = path.join(__dirname, '..', '..', 'public', 'uploads', curriculoNome);

    await curriculoFile.mv(curriculoPath);

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
// Listar todos os candidatos de uma vaga específica
exports.getCandidatosPorVaga = async (req, res) => {
    const { vagaId } = req.params;
    try {
        // Query SQL atualizada para buscar também os documentos de cada candidatura
        const query = `
            SELECT 
                c.id AS candidatura_id, 
                c.status, 
                c.pontuacao_teste,
                c.curriculo AS curriculo_path,
                u.nome, 
                u.email,
                (SELECT GROUP_CONCAT(CONCAT(d.tipo, '::', d.caminho) SEPARATOR ';;') 
                 FROM documentos d 
                 WHERE d.candidatura_id = c.id) AS outros_documentos
            FROM candidaturas c
            JOIN usuarios u ON c.candidato_id = u.id
            WHERE c.vaga_id = ?
            GROUP BY c.id;
        `;
        
        const [candidatos] = await db.query(query, [vagaId]);
        res.status(200).json(candidatos);
    } catch (error) {
        console.error('Erro ao buscar candidatos por vaga:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar candidatos.' });
    }
};

// Atualizar o status de uma candidatura
exports.updateStatusCandidatura = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Lista de todos os status permitidos (deve ser IGUAL ao seu ENUM no banco)
    const statusPermitidos = [
        'Aguardando Teste', 
        'Teste Disponível', 
        'Entrevista com RH', 
        'Entrevista com Gestor', 
        'Manual', 
        'Envio de Documentos', 
        'Finalizado'
    ];

    // 2. Validação explícita do status
    if (!status) {
        return res.status(400).json({ message: 'O novo status é obrigatório.' });
    }

    if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ message: `O status "${status}" é inválido.` });
    }

    // 3. Se a validação passar, atualiza o banco
    try {
        const query = 'UPDATE candidaturas SET status = ? WHERE id = ?';
        const [result] = await db.query(query, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidatura não encontrada.' });
        }

        res.status(200).json({ message: 'Status da candidatura atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar status da candidatura:', error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar o status.' });
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

exports.uploadDocumento = async (req, res) => {
  try {
    // Pega o ID da candidatura a partir dos parâmetros da URL
    const { id: candidatura_id } = req.params;
    // Pega o tipo de documento do corpo da requisição
    const { tipo } = req.body;

    // Verifica se algum arquivo foi enviado
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    const arquivo = req.files.documento;

    // Validação básica para garantir que o tipo e o arquivo existem
    if (!tipo || !arquivo) {
        return res.status(400).json({ message: 'Tipo de documento ou arquivo ausente.' });
    }

    // Cria um nome de arquivo único para evitar conflitos
    const nomeArquivo = `${candidatura_id}-${tipo}-${Date.now()}-${arquivo.name}`;
    
    // --- CORREÇÃO APLICADA AQUI ---
    // Constrói o caminho absoluto para a pasta de uploads de forma segura
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', nomeArquivo);

    // Move o arquivo para a pasta de uploads
    await arquivo.mv(uploadPath);

    const caminhoFinal = `/uploads/${nomeArquivo}`;

    // Insere o registro do documento no banco de dados
    await db.query(
      'INSERT INTO documentos (candidatura_id, tipo, caminho) VALUES (?, ?, ?)',
      [candidatura_id, tipo, caminhoFinal]
    );

    res.status(201).json({ message: `Documento '${tipo}' enviado com sucesso!` });

  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error);
    res.status(500).json({ message: 'Erro no servidor ao processar o documento.' });
  }
};