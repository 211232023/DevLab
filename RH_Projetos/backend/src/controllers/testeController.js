const db = require('../config/db');

// --- CRUD PARA TESTES ---

/**
 * Cria um novo teste e o associa a uma vaga.
 */
exports.createTeste = async (req, res) => {
    const { vaga_id, titulo, descricao } = req.body;

    if (!vaga_id || !titulo) {
        return res.status(400).json({ message: 'ID da vaga e título do teste são obrigatórios.' });
    }

    try {
        const query = 'INSERT INTO testes (vaga_id, titulo, descricao) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [vaga_id, titulo, descricao]);
        res.status(201).json({ message: 'Teste criado e associado à vaga com sucesso!', testeId: result.insertId });
    } catch (error) {
        console.error('Erro ao criar teste:', error);
        res.status(500).json({ message: 'Erro no servidor ao criar o teste.' });
    }
};

/**
 * Adiciona uma questão já existente a um teste.
 */
exports.addQuestaoToTeste = async (req, res) => {
    const { teste_id } = req.params;
    const { questao_id } = req.body;

    if (!questao_id) {
        return res.status(400).json({ message: 'ID da questão é obrigatório.' });
    }

    try {
        const query = 'INSERT INTO testes_questoes (teste_id, questao_id) VALUES (?, ?)';
        await db.query(query, [teste_id, questao_id]);
        res.status(200).json({ message: 'Questão adicionada ao teste com sucesso!' });
    } catch (error) {
        // Trata erro de chave duplicada (questão já existe no teste)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Esta questão já foi adicionada a este teste.' });
        }
        console.error('Erro ao adicionar questão ao teste:', error);
        res.status(500).json({ message: 'Erro no servidor ao adicionar a questão.' });
    }
};

/**
 * Remove uma questão de um teste.
 */
exports.removeQuestaoFromTeste = async (req, res) => {
    const { teste_id, questao_id } = req.params;
    try {
        const query = 'DELETE FROM testes_questoes WHERE teste_id = ? AND questao_id = ?';
        const [result] = await db.query(query, [teste_id, questao_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'A questão não foi encontrada neste teste.' });
        }
        res.status(200).json({ message: 'Questão removida do teste com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover questão do teste:', error);
        res.status(500).json({ message: 'Erro no servidor ao remover a questão.' });
    }
};

/**
 * Busca um teste completo (com questões e alternativas) pelo ID da vaga.
 */
exports.getTesteByVagaId = async (req, res) => {
    const { vaga_id } = req.params;
    try {
        const [testes] = await db.query('SELECT * FROM testes WHERE vaga_id = ?', [vaga_id]);
        if (testes.length === 0) {
            return res.status(404).json({ message: 'Nenhum teste encontrado para esta vaga.' });
        }
        const teste = testes[0];

        const query = `
            SELECT q.*, a.id as alternativa_id, a.texto, a.correta
            FROM testes_questoes tq
            JOIN questoes q ON tq.questao_id = q.id
            JOIN alternativas a ON a.questao_id = q.id
            WHERE tq.teste_id = ?
            ORDER BY q.id, a.id;
        `;
        const [questoesComAlternativas] = await db.query(query, [teste.id]);
        
        // Agrupando os resultados para montar o objeto final
        const questoesMap = new Map();
        questoesComAlternativas.forEach(row => {
            if (!questoesMap.has(row.id)) {
                questoesMap.set(row.id, {
                    id: row.id,
                    enunciado: row.enunciado,
                    area_conhecimento: row.area_conhecimento,
                    alternativas: []
                });
            }
            questoesMap.get(row.id).alternativas.push({
                id: row.alternativa_id,
                texto: row.texto,
                // --- ALTERAÇÃO: Converte 1/0 para true/false ---
                correta: !!row.correta 
            });
        });

        const resultadoFinal = {
            ...teste,
            questoes: Array.from(questoesMap.values())
        };

        res.status(200).json(resultadoFinal);
    } catch (error) {
        console.error('Erro ao buscar teste:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar o teste.' });
    }
};