const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.resolve(__dirname, '../config/db'));
const bcrypt = require('bcrypt');

// Rota para registrar um novo candidato
router.post('/register/candidato', async (req, res) => {
    const { nome, cpf, email, telefone, genero, senha } = req.body;

    // Validação para garantir que todos os campos foram preenchidos
    if (!nome || !cpf || !email || !telefone || !genero || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        // Verifica se o e-mail já está cadastrado no banco de dados
        const [rows] = await db.execute('SELECT * FROM candidatos WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
        }

        // Criptografa a senha antes de salvar no banco de dados
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Insere o novo candidato no banco de dados
        const [result] = await db.execute(
            'INSERT INTO candidatos (nome, cpf, email, telefone, genero, senha, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [nome, cpf, email, telefone, genero, hashedPassword]
        );

        res.status(201).json({ message: 'Candidato cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar candidato:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para o login de candidato
router.post('/login/candidato', async (req, res) => {
    const { email, senha } = req.body;

    // Validação para garantir que todos os campos foram preenchidos
    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    try {
        // Verifica se o candidato existe no banco de dados
        const [rows] = await db.execute('SELECT * FROM candidatos WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Candidato não encontrado' });
        }

        const candidato = rows[0];

        // Compara a senha fornecida com a senha criptografada no banco de dados
        const senhaCorreta = await bcrypt.compare(senha, candidato.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Se as credenciais estiverem corretas, retorna uma mensagem de sucesso com os dados do usuário
        res.status(200).json({ message: 'Login bem-sucedido!', user: candidato });
    } catch (error) {
        console.error('Erro ao fazer login do candidato:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;