// RH_Projetos/backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.resolve(__dirname, '../config/db'));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioController = require('../controllers/usuarioController'); // <-- ESTA LINHA FALTAVA

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

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

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = rows[0];

        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = generateToken(user.id);

        delete user.senha;

        res.status(200).json({
            message: 'Login bem-sucedido!',
            user: user,
            token: token 
        });

    } catch (error) {
        console.error('Erro ao fazer login do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.post('/forgot-password', usuarioController.requestPasswordReset); 

router.post('/reset-password/:token', usuarioController.resetPassword);

module.exports = router;