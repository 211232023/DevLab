const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.resolve(__dirname, '../config/db'));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Função para gerar o token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expira em 1 dia
  });
};

// Rota para registrar um novo usuário (já corrigida anteriormente)
router.post('/register', async (req, res) => {
    const { nome, cpf, email, telefone, genero, senha, tipo } = req.body;

    if (!nome || !cpf || !email || !telefone || !genero || !senha || !tipo) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (tipo !== 'Candidato' && tipo !== 'RH') {
        return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, cpf, email, telefone, genero, senha, tipo, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [nome, cpf, email, telefone, genero, hashedPassword, tipo]
        );

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para o login de usuário (CORRIGIDA E REATORADA)
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    try {
        // Verifica se o usuário existe no banco de dados
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = rows[0];

        // Compara a senha fornecida com a senha criptografada
        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // 2. Gere o token e o envie junto com os dados do usuário
        const token = generateToken(user.id);

        // Remove a senha do objeto de usuário antes de enviar a resposta
        delete user.senha;

        res.status(200).json({
            message: 'Login bem-sucedido!',
            user: user,
            token: token // <-- TOKEN ENVIADO AQUI
        });

    } catch (error) {
        console.error('Erro ao fazer login do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;