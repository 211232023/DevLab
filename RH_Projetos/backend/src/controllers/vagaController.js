const db = require('../config/db');

// Criar uma nova vaga
exports.createVaga = (req, res) => {
    // Extrai os dados do corpo da requisição, que agora correspondem à tabela
    const { 
        rh_id, 
        titulo, 
        area, 
        salario, 
        descricao, 
        data_Abertura, 
        data_fechamento, 
        escala_trabalho, 
        beneficios 
    } = req.body;

    // Validação para garantir que os campos essenciais foram recebidos
    if (!rh_id || !titulo || !area || !salario || !descricao || !data_Abertura || !data_fechamento || !escala_trabalho) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const query = `
        INSERT INTO vagas (
            rh_id, 
            titulo, 
            area, 
            salario, 
            descricao, 
            data_Abertura, 
            data_fechamento, 
            escala_trabalho, 
            beneficios
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        rh_id,
        titulo,
        area,
        salario,
        descricao,
        data_Abertura,
        data_fechamento,
        escala_trabalho,
        beneficios // O valor de 'beneficios' já vem como string do frontend
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao criar vaga:', err);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.' });
        }
        res.status(201).json({ message: 'Vaga criada com sucesso!', vagaId: result.insertId });
    });
};

// Obter todas as vagas (mantido para referência)
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

// ... (outras funções do seu controller podem continuar aqui)