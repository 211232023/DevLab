const db = require('../config/db');

exports.createQuestao = async (req, res) => {
    const { enunciado, area_conhecimento, alternativas } = req.body;

    if (!enunciado || !alternativas || !Array.isArray(alternativas) || alternativas.length === 0) {
        return res.status(400).json({ message: 'Enunciado e alternativas são obrigatórios.' });
    }
    if (!alternativas.some(alt => alt.correta)) {
        return res.status(400).json({ message: 'Pelo menos uma alternativa deve ser marcada como correta.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const questaoQuery = 'INSERT INTO questoes (enunciado, area_conhecimento) VALUES (?, ?)';
        const [questaoResult] = await connection.query(questaoQuery, [enunciado, area_conhecimento]);
        const questaoId = questaoResult.insertId;

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

exports.getAllQuestoes = async (req, res) => {
    try {
        const [questoes] = await db.query('SELECT * FROM questoes ORDER BY area_conhecimento, id');
        const [alternativas] = await db.query('SELECT * FROM alternativas');

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