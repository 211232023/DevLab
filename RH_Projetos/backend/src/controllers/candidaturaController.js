const db = require('../config/db');
const path = require('path');
const { sendStageUpdateEmail, sendRejectionEmail } = require('../../nodemailer');

exports.inscreverCandidato = async (req, res) => {
  try {
    const { vaga_id } = req.params;
    const candidato_id = req.user.id;
    const { endereco } = req.body;

    const [existente] = await db.query(
      'SELECT id FROM candidaturas WHERE candidato_id = ? AND vaga_id = ?',
      [candidato_id, vaga_id]
    );

    if (existente.length > 0) {
      return res.status(409).json({ error: 'Você já se candidatou para esta vaga.' });
    }

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

// helper: deleta e notifica candidato por email (em background)
async function deleteAndNotify(candidaturaId) {
  const [rows] = await db.query(
    `SELECT c.id, u.nome, u.email, v.titulo AS vaga_titulo
     FROM candidaturas c
     JOIN usuarios u ON c.candidato_id = u.id
     JOIN vagas v ON c.vaga_id = v.id
     WHERE c.id = ?`,
    [candidaturaId]
  );

  if (rows.length === 0) return { ok: false, status: 404, message: 'Candidatura não encontrada.' };

  const candidate = rows[0];

  const [result] = await db.query('DELETE FROM candidaturas WHERE id = ?', [candidaturaId]);

  if (result.affectedRows === 0) return { ok: false, status: 404, message: 'Candidatura não encontrada.' };

  // envia email em background (não bloqueia o fluxo)
  sendRejectionEmail({
    email: candidate.email,
    nome: candidate.nome,
    vaga: candidate.vaga_titulo || 'Vaga',
    link: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/minhas-candidaturas`
  }).catch(e => console.error('Falha ao notificar candidato por email:', e && e.message ? e.message : e));

  return { ok: true };
}

exports.desistirDeVaga = async (req, res) => {
  const { candidatura_id } = req.params;

  if (!candidatura_id) {
    return res.status(400).json({ message: 'O ID da candidatura é obrigatório.' });
  }

  try {
    const result = await deleteAndNotify(candidatura_id);
    if (!result.ok) return res.status(result.status).json({ message: result.message });
    return res.status(200).json({ message: 'Você desistiu da vaga com sucesso.' });
  } catch (error) {
    console.error('Erro ao desistir da vaga:', error);
    return res.status(500).json({ message: 'Erro no servidor ao tentar desistir da vaga.' });
  }
};

exports.getCandidatosPorVaga = async (req, res) => {
  const { vagaId } = req.params;
  try {
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

exports.updateStatusCandidatura = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusPermitidos = [
      'Aguardando Teste', 
      'Teste Disponível', 
      'Entrevista com RH', 
      'Entrevista com Gestor', 
      'Manual', 
      'Envio de Documentos', 
      'Finalizado'
  ];

  if (!status) {
      return res.status(400).json({ message: 'O novo status é obrigatório.' });
  }

  if (!statusPermitidos.includes(status)) {
      return res.status(400).json({ message: `O status "${status}" é inválido.` });
  }

  try {
      // Busca dados do candidato e vaga para enviar email
      const [candidaturas] = await db.query(
        `SELECT 
          c.id, c.status,
          u.nome AS candidato_nome,
          u.email AS candidato_email,
          v.titulo AS vaga_titulo
        FROM candidaturas c
        INNER JOIN usuarios u ON c.candidato_id = u.id
        INNER JOIN vagas v ON c.vaga_id = v.id
        WHERE c.id = ?`,
        [id]
      );

      if (candidaturas.length === 0) {
          return res.status(404).json({ message: 'Candidatura não encontrada.' });
      }

      const candidatura = candidaturas[0];

      // Atualiza o status
      const query = 'UPDATE candidaturas SET status = ? WHERE id = ?';
      await db.query(query, [status, id]);

      // Envia email de forma assíncrona
      sendStageUpdateEmail({
        email: candidatura.candidato_email,
        nome: candidatura.candidato_nome,
        vaga: candidatura.vaga_titulo,
        etapa: status,
        link: `${process.env.APP_BASE_URL}/minhas-candidaturas`,
      }).catch((err) => {
        console.error('❌ Falha ao enviar email de atualização de status:', err && err.message ? err.message : err);
      });

      res.status(200).json({ message: 'Status da candidatura atualizado com sucesso!' });
  } catch (error) {
      console.error('Erro ao atualizar status da candidatura:', error);
      res.status(500).json({ message: 'Erro no servidor ao atualizar o status.' });
  }
};

exports.deleteCandidatura = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: 'O ID da candidatura é obrigatório.' });

  try {
    const result = await deleteAndNotify(id);
    if (!result.ok) return res.status(result.status).json({ message: result.message });
    return res.status(200).json({ message: 'Candidatura eliminada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar candidatura:', error);
    return res.status(500).json({ message: 'Erro no servidor ao tentar eliminar a candidatura.' });
  }
};

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
    const { id: candidatura_id } = req.params;
    const { tipo } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    const arquivo = req.files.documento;

    if (!tipo || !arquivo) {
        return res.status(400).json({ message: 'Tipo de documento ou arquivo ausente.' });
    }

    const nomeArquivo = `${candidatura_id}-${tipo}-${Date.now()}-${arquivo.name}`;
    
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', nomeArquivo);

    await arquivo.mv(uploadPath);

    const caminhoFinal = `/uploads/${nomeArquivo}`;

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