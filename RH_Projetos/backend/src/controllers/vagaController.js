const db = require('../config/db');

// 1. Defina todas as suas funções como constantes (const)

const createVaga = async (req, res) => {
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

    try {
        const [result] = await db.query(query, values);
        res.status(201).json({ message: 'Vaga criada com sucesso!', vagaId: result.insertId });
    } catch (err) {
        console.error('Erro ao criar vaga:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.' });
    }
};

const getAllVagas = async (req, res) => {
    const query = 'SELECT * FROM vagas';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Erro ao obter vagas:', err);
        res.status(500).send('Erro ao obter vagas');
    }
};

const getVagaById = async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM vagas WHERE id = ?';
    try {
        const [results] = await db.query(query, [id]);
        if (results.length === 0) {
            return res.status(404).send('Vaga não encontrada');
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Erro ao obter vaga:', err);
        res.status(500).send('Erro ao obter vaga');
    }
};

const updateVaga = async (req, res) => {
    const { id } = req.params;
    const { titulo, area, salario, descricao, data_Abertura, data_fechamento, escala_trabalho, beneficios } = req.body;
    const query = `
        UPDATE vagas SET titulo = ?, area = ?, salario = ?, descricao = ?, 
        data_Abertura = ?, data_fechamento = ?, escala_trabalho = ?, beneficios = ?
        WHERE id = ?
    `;
    const values = [titulo, area, salario, descricao, data_Abertura, data_fechamento, escala_trabalho, beneficios, id];

    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 0) {
            return res.status(404).send('Vaga não encontrada para atualização');
        }
        res.send('Vaga atualizada com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar vaga:', err);
        res.status(500).send('Erro ao atualizar vaga');
    }
};

const deleteVaga = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM vagas WHERE id = ?';
    try {
        const [result] = await db.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Vaga não encontrada para deletar');
        }
        res.send('Vaga deletada com sucesso');
    } catch (err) {
        console.error('Erro ao deletar vaga:', err);
        res.status(500).send('Erro ao deletar vaga');
    }
};

// 2. Exporte todas as funções em um único objeto no final do arquivo
module.exports = {
    createVaga,
    getAllVagas,
    getVagaById,
    updateVaga,
    deleteVaga
};