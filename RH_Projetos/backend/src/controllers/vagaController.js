const db = require('../config/db');

// Criar uma nova vaga
exports.createVaga = (req, res) => {
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

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao criar vaga:', err);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.' });
        }
        res.status(201).json({ message: 'Vaga criada com sucesso!', vagaId: result.insertId });
    });
};

// Obter todas as vagas
exports.getAllVagas = (req, res) => {
    const query = 'SELECT * FROM vagas';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao obter vagas:', err);
            return res.status(500).send('Erro ao obter vagas');
        }
        res.json(results);
    });
};

// Obter uma vaga específica pelo ID
exports.getVagaById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM vagas WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Erro ao obter vaga:', err);
            return res.status(500).send('Erro ao obter vaga');
        }
        if (results.length === 0) {
            return res.status(404).send('Vaga não encontrada');
        }
        res.json(results[0]);
    });
};

// Atualizar uma vaga
exports.updateVaga = (req, res) => {
    const { id } = req.params;
    const { titulo, area, salario, descricao, data_Abertura, data_fechamento, escala_trabalho, beneficios } = req.body;
    const query = `
        UPDATE vagas SET titulo = ?, area = ?, salario = ?, descricao = ?, 
        data_Abertura = ?, data_fechamento = ?, escala_trabalho = ?, beneficios = ?
        WHERE id = ?
    `;
    const values = [titulo, area, salario, descricao, data_Abertura, data_fechamento, escala_trabalho, beneficios, id];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao atualizar vaga:', err);
            return res.status(500).send('Erro ao atualizar vaga');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Vaga não encontrada para atualização');
        }
        res.send('Vaga atualizada com sucesso');
    });
};

// Deletar uma vaga
exports.deleteVaga = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM vagas WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erro ao deletar vaga:', err);
            return res.status(500).send('Erro ao deletar vaga');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Vaga não encontrada para deletar');
        }
        res.send('Vaga deletada com sucesso');
    });
};