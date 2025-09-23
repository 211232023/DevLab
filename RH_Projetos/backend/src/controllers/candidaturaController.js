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
      return res.status(200).json([]);
    }
    res.status(200).json(candidaturas);
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar as candidaturas.' });
  }
};

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
exports.getCandidatosPorVaga = async (req, res) => {
    const { vagaId } = req.params;
    try {
        // --- CORREÇÃO AQUI: Adicionamos u.telefone na query ---
        const query = `
            SELECT 
                c.id AS candidatura_id, 
                c.status, 
                c.pontuacao_teste,
                c.curriculo AS curriculo_path,
                u.nome, 
                u.email,
                u.telefone  -- Adicionado para buscar o telefone do usuário
            FROM candidaturas c
            JOIN usuarios u ON c.candidato_id = u.id
            WHERE c.vaga_id = ?;
        `;
        
        const [candidatos] = await db.query(query, [vagaId]);
        res.status(200).json(candidatos);
    } catch (error) {
        console.error('Erro ao buscar candidatos por vaga:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar candidatos.' });
    }
};

// --- NOVA FUNÇÃO ADICIONADA: Buscar documentos por candidatura ---
exports.getDocumentosPorCandidatura = async (req, res) => {
  const { id } = req.params; // Aqui, 'id' é o candidatura_id
  try {
    const query = 'SELECT * FROM documentos WHERE candidatura_id = ?';
    const [documentos] = await db.query(query, [id]);
    
    if (documentos.length === 0) {
      return res.status(200).json([]); // É normal não ter documentos, então retorna array vazio
    }

    // Mapeia os resultados para garantir que os caminhos dos arquivos estão corretos
    const documentosFormatados = documentos.map(doc => ({
      ...doc,
      caminho_arquivo: doc.caminho_arquivo.replace(/\\/g, '/').replace('public/', '')
    }));

    res.status(200).json(documentosFormatados);
  } catch (error) {
    console.error('Erro ao buscar documentos da candidatura:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar documentos.' });
  }
};


exports.updateStatusCandidatura = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const statusPermitidos = [
        'Aguardando Teste', 'Teste Disponível', 'Entrevista com RH', 
        'Entrevista com Gestor', 'Manual', 'Envio de Documentos', 'Finalizado'
    ];
    if (!status || !statusPermitidos.includes(status)) {
        return res.status(400).json({ message: `O status "${status}" é inválido ou não foi fornecido.` });
    }
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

exports.getCandidaturaById = async (req, res) => {
  const { id } = req.params;
  try {
    const [candidaturas] = await db.query('SELECT * FROM candidaturas WHERE id = ?', [id]);
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