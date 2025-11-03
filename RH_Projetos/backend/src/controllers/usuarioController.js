const path = require('path');
const pool = require(path.resolve(__dirname, '../config/db'));
const { sendMail } = require('../../nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// ATENÇÃO: Armazenar códigos em memória não é ideal para produção.
// Se o servidor reiniciar, todos os códigos de verificação são perdidos.
// Considere usar um banco de dados (como Redis) ou uma tabela no MySQL.
const codigosVerificacao = {};

function gerarCodigoAleatorio(tamanho = 6) {
  let codigo = '';
  for (let i = 0; i < tamanho; i++) {
    codigo += Math.floor(Math.random() * 10);
  }
  return codigo;
}

// Sem alterações nesta função
exports.enviarCodigoVerificacao = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const codigo = gerarCodigoAleatorio();
    const expiracao = Date.now() + 15 * 60 * 1000; // Expira em 15 minutos

    codigosVerificacao[email] = { codigo, expiracao, verificado: false };

    console.log(`Código para ${email}: ${codigo}`); // Log para depuração

    await sendMail({
      to: email,
      subject: 'Seu Código de Verificação - DevLab',
      text: `Olá,\n\nSeu código de verificação é: ${codigo}\n\nEste código expira em 15 minutos.\n\nAtenciosamente,\nEquipe DevLab`,
      // html: `<p>Olá,</p><p>Seu código de verificação é: <strong>${codigo}</strong></p><p>Este código expira em 15 minutos.</p><p>Atenciosamente,<br/>Equipe DevLab</p>` // Exemplo com HTML
    });

    res.status(200).json({ message: 'Código de verificação enviado para o seu e-mail.' });

  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error);
    if (error.responseCode === 550 || error.code === 'EENVELOPE' || error.code === 'ESOCKET') {
      return res.status(400).json({ error: 'Não foi possível enviar o e-mail para este endereço. Verifique se ele está correto e tente novamente.' });
    }
    res.status(500).json({ error: 'Erro interno ao enviar código de verificação.', details: error.message });
  }
};

// Sem alterações nesta função
exports.validarCodigoVerificacao = async (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
  }

  try {
    const dadosCodigo = codigosVerificacao[email];

    if (!dadosCodigo) {
      return res.status(400).json({ error: 'Código inválido ou não solicitado para este e-mail.' });
    }

    if (Date.now() > dadosCodigo.expiracao) {
      delete codigosVerificacao[email]; // Limpa código expirado
      return res.status(400).json({ error: 'Código de verificação expirado. Solicite um novo.' });
    }

    if (dadosCodigo.codigo !== codigo) {
      return res.status(400).json({ error: 'Código de verificação inválido.' });
    }

    codigosVerificacao[email].verificado = true;

    res.status(200).json({ message: 'E-mail verificado com sucesso!' });

  } catch (error) {
    console.error('Erro ao validar código:', error);
    res.status(500).json({ error: 'Erro interno ao validar o código.', details: error.message });
  }
};


// Sem alterações nesta função
exports.createUsuario = async (req, res) => {
  try {
    const { nome, cpf, email, telefone, genero, senha, tipo } = req.body;

    // ** Verificação do Status do Email **
    // Confia que o frontend só chamará esta rota APÓS a validação.
    // Para segurança extra no backend, descomente as linhas abaixo:
    // const dadosCodigo = codigosVerificacao[email];
    // if (!dadosCodigo || !dadosCodigo.verificado) {
    //   return res.status(400).json({ error: 'E-mail não verificado ou verificação expirada.' });
    // }

    if (!nome || !cpf || !email || !telefone || !genero || !senha || !tipo) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const [existingRows] = await pool.query('SELECT id FROM usuarios WHERE email = ? OR cpf = ?', [email, cpf]);
    if (existingRows.length > 0) {
      delete codigosVerificacao[email];
      return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });
    }


    const hashedPassword = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, cpf, email, telefone, genero, senha, tipo, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [nome, cpf, email, telefone, genero, hashedPassword, tipo]
    );

    delete codigosVerificacao[email];

    res.status(201).json({ message: 'Cadastro realizado com sucesso!', id: result.insertId, nome, cpf, email, telefone, genero, tipo });

  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    if (req.body.email) {
      delete codigosVerificacao[req.body.email];
    }
    res.status(500).json({ error: 'Erro interno ao cadastrar usuário.', details: err.message });
  }
};

// Sem alterações nesta função
exports.getAllUsuarios = async (req, res) => {
  try {
    // Evita retornar senha
    const [rows] = await pool.query('SELECT id, nome, cpf, email, telefone, genero, tipo, data_cadastro FROM usuarios');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários.', details: err.message });
  }
};

// Sem alterações nesta função
exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    // Evita retornar senha
    const [rows] = await pool.query('SELECT id, nome, cpf, email, telefone, genero, tipo, data_cadastro FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário.', details: err.message });
  }
};

// REATORADO:
// 1. Remove 'tipo' da desestruturação. A mudança de tipo deve ser feita pela rota '/:id/tipo'.
// 2. Verifica se o usuário logado está atualizando a si mesmo ou se é um ADMIN.
// 3. Corrigido 'SELECT *' para 'SELECT id, ...'
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params; // ID do usuário a ser atualizado
    const loggedInUserId = req.usuario.id; // ID do usuário logado (via authMiddleware)
    const loggedInUserType = req.usuario.tipo; // Tipo do usuário logado (via authMiddleware)

    // Regra de segurança: Usuário só pode atualizar a si mesmo, a menos que seja ADMIN
    if (Number(id) !== loggedInUserId && loggedInUserType !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso não autorizado. Você só pode atualizar o seu próprio perfil.' });
    }

    // 'tipo' foi removido daqui
    const { nome, cpf, email, genero, telefone, senha } = req.body;

    // Verificar se o usuário existe
    // REATORADO: Corrigido SELECT *
    const [usuarioRows] = await pool.query(
        'SELECT id, nome, cpf, email, genero, telefone, tipo FROM usuarios WHERE id = ?', 
        [id]
    );
    
    if (usuarioRows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const usuario = usuarioRows[0];
    const camposParaAtualizar = {};
    const queryParams = [];

    // Monta dinamicamente os campos a serem atualizados
    if (nome !== undefined && nome !== usuario.nome) { camposParaAtualizar.nome = nome; }
    if (cpf !== undefined && cpf !== usuario.cpf) { camposParaAtualizar.cpf = cpf; }
    if (email !== undefined && email !== usuario.email) { camposParaAtualizar.email = email; } // Adicionar lógica se precisar revalidar email
    if (genero !== undefined && genero !== usuario.genero) { camposParaAtualizar.genero = genero; }
    if (telefone !== undefined && telefone !== usuario.telefone) { camposParaAtualizar.telefone = telefone; }
    // A atualização de 'tipo' foi removida desta função

    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      camposParaAtualizar.senha = hashedPassword;
    }

    const camposNomes = Object.keys(camposParaAtualizar);
    if (camposNomes.length === 0) { // !senha removido, pois já está nos campos
      return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
    }

    // Construir a query SQL
    let query = 'UPDATE usuarios SET ';
    query += camposNomes.map(campo => `${campo} = ?`).join(', ');
    queryParams.push(...camposNomes.map(campo => camposParaAtualizar[campo]));

    query += ' WHERE id = ?';
    queryParams.push(id);

    await pool.query(query, queryParams);

    // Retorna os dados atualizados (sem a senha)
    const usuarioAtualizado = { ...usuario };
    Object.assign(usuarioAtualizado, camposParaAtualizar);
    delete usuarioAtualizado.senha; // Garante que a senha não seja retornada

    res.json({ message: 'Usuário atualizado com sucesso!', usuario: usuarioAtualizado });

  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Erro ao atualizar: E-mail ou CPF já está em uso por outro usuário.' });
    }
    res.status(500).json({ error: 'Erro interno ao atualizar usuário.', details: err.message });
  }
};

// --- NOVO ---
// Esta função é chamada pela nova rota PUT /:id/tipo
// Específica para Admin (definido nas rotas)
exports.updateUsuarioTipo = async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  // Validar o tipo recebido
  const tiposValidos = ['ADMIN', 'RH', 'CANDIDATO'];
  if (!tipo || !tiposValidos.includes(tipo.toUpperCase())) {
    return res.status(400).json({ error: 'Tipo de usuário inválido. Valores permitidos: ADMIN, RH, CANDIDATO.' });
  }

  // Opcional: Impedir que o admin altere o próprio tipo (embora o frontend já faça isso)
  if (Number(id) === req.usuario.id) {
     return res.status(403).json({ error: 'Você não pode alterar o tipo do seu próprio usuário pela interface de gestão.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET tipo = ? WHERE id = ?',
      [tipo.toUpperCase(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json({ message: 'Tipo de usuário atualizado com sucesso!' });

  } catch (err) {
    console.error('Erro ao atualizar tipo de usuário:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar o tipo de usuário.', details: err.message });
  }
};
// --- FIM DO NOVO ---

// Sem alterações nesta função
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Opcional: Impedir que o admin delete a si mesmo (embora o frontend já faça isso)
    if (Number(id) === req.usuario.id) {
        return res.status(403).json({ error: 'Você não pode deletar a si mesmo.' });
    }

    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover usuário:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Não é possível remover o usuário pois ele possui registros relacionados (ex: candidaturas).' });
    }
    res.status(500).json({ error: 'Erro ao remover usuário.', details: err.message });
  }
};

// Sem alterações nesta função
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'O email é obrigatório.' });
    }

    try {
        const [users] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

        if (users.length === 0) {
            console.log(`Tentativa de reset para email não encontrado: ${email}`);
            // Resposta genérica para não vazar informação se o email existe ou não
            return res.status(200).json({ message: 'Se um usuário com este email existir, um link de redefinição de senha foi enviado.' });
        }

        const userId = users[0].id;
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora

        await pool.query(
            'UPDATE usuarios SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
            [token, expires, userId]
        );

        const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        const resetUrl = `${appBaseUrl}/reset-password/${token}`;

        const subject = 'Redefinição de Senha - DevLab';
        const text = `Você solicitou uma redefinição de senha. Clique no link a seguir para redefinir sua senha: ${resetUrl}\n\nSe você não solicitou isso, ignore este email.\nEste link expira em 1 hora.`;
        const html = `<p>Você solicitou uma redefinição de senha.</p><p>Clique no link a seguir para redefinir sua senha: <a href="${resetUrl}">${resetUrl}</a></p><p>Se você não solicitou isso, ignore este email.</p><p>Este link expira em 1 hora.</p>`;

        try {
            await sendMail({ to: email, subject, text, html });
            console.log(`Email de redefinição enviado para ${email}`);
            res.status(200).json({ message: 'Se um usuário com este email existir, um link de redefinição de senha foi enviado.' });
        } catch (mailError) {
            console.error('Erro ao enviar email de redefinição:', mailError);
            res.status(200).json({ message: 'Se um usuário com este email existir, um link de redefinição de senha foi enviado.' });
        }

    } catch (error) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        res.status(500).json({ message: 'Ocorreu um problema ao processar sua solicitação.' });
    }
};

// Sem alterações nesta função
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'A nova senha é obrigatória.' });
    }

    try {
        const now = new Date();

        const [users] = await pool.query(
            'SELECT id FROM usuarios WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
            [token, now]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }

        const userId = users[0].id;
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'UPDATE usuarios SET senha = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro ao redefinir a senha.', error: error.message });
    }
};