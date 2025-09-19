const db = require('../config/db');

// --- CRUD PARA QUESTÕES E ALTERNATIVAS ---

/**
 * Cria uma nova questão com suas alternativas.
 * Utiliza uma transação para garantir que a questão e suas alternativas sejam salvas juntas.
 */
exports.createQuestao = async (req, res) => {
    const { enunciado, area_conhecimento, alternativas } = req.body;

    // Validação básica
    if (!enunciado || !alternativas || !Array.isArray(alternativas) || alternativas.length === 0) {
        return res.status(400).json({ message: 'Enunciado e alternativas são obrigatórios.' });
    }
    if (!alternativas.some(alt => alt.correta)) {
        return res.status(400).json({ message: 'Pelo menos uma alternativa deve ser marcada como correta.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insere a questão
        const questaoQuery = 'INSERT INTO questoes (enunciado, area_conhecimento) VALUES (?, ?)';
        const [questaoResult] = await connection.query(questaoQuery, [enunciado, area_conhecimento]);
        const questaoId = questaoResult.insertId;

        // 2. Insere as alternativas
        const alternativasValues = alternativas.map(alt => [questaoId, alt.texto, alt.correta || false]);
        const alternativasQuery = 'INSERT INTO alternativas (questao_id, texto, correta) VALUES ?';
        await connection.query(alternativasQuery, [alternativasValues]);

        await connection.commit();
        res.status(201).json({ message: 'Questão criada com sucesso!', questaoId });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao criar questão:', error);
        res.status(500).json({ message: 'Erro no servidor ao criar a questão.' });
    } finally {
        connection.release();
    }
};

/**
 * Lista todas as questões com suas respectivas alternativas.
 */
exports.getAllQuestoes = async (req, res) => {
    try {
        const [questoes] = await db.query('SELECT * FROM questoes ORDER BY area_conhecimento, id');
        const [alternativas] = await db.query('SELECT * FROM alternativas');

        // Agrupa as alternativas por questão
        const questoesComAlternativas = questoes.map(q => ({
            ...q,
            alternativas: alternativas.filter(alt => alt.questao_id === q.id)
        }));

        res.status(200).json(questoesComAlternativas);
    } catch (error) {
        console.error('Erro ao listar questões:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar as questões.' });
    }
};

/**
 * Deleta uma questão (e suas alternativas, via ON DELETE CASCADE do SQL).
 */
exports.deleteQuestao = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM questoes WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Questão não encontrada.' });
        }
        res.status(200).json({ message: 'Questão deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar questão:', error);
        res.status(500).json({ message: 'Erro no servidor ao deletar a questão.' });
    }
};