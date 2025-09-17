const db = require('../config/db');

/**
 * Cria uma nova vaga a partir dos dados enviados pelo frontend.
 */
exports.createVaga = (req, res) => {
    // Extrai os campos do corpo da requisição
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

    // Query SQL para inserir a nova vaga na tabela
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
    
    // Array com os valores para a query
    const values = [
        rh_id,
        titulo,
        area,
        salario,
        descricao,
        data_Abertura,
        data_fechamento,
        escala_trabalho,
        beneficios, // O benefício já chega como uma string formatada
    ];

    // Executa a query no banco de dados
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao criar vaga no banco de dados:', err);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar a vaga.' });
        }
        res.status(201).json({ message: 'Vaga criada com sucesso!', vagaId: result.insertId });
    });
};

/**
 * Obtém todas as vagas cadastradas.
 */
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

// Se houver outras funções no seu controller, elas permanecerão aqui.