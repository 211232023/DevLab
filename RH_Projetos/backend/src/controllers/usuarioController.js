const path = require('path');
const pool = require(path.resolve(__dirname, '../config/db')); 
const { sendMail } = require('../../nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const codigosVerificacao = {};

function gerarCodigoAleatorio(tamanho = 6) {
  let codigo = '';
  for (let i = 0; i < tamanho; i++) {
    codigo += Math.floor(Math.random() * 10);
  }
  return codigo;
}

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
    // Opcional: Verificar se o email já existe ANTES de enviar o código,
    //           se você não permitir cadastro duplicado.
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const codigo = gerarCodigoAleatorio();
    const expiracao = Date.now() + 15 * 60 * 1000; // Expira em 15 minutos

    // Armazenar código (substitua por lógica de banco de dados/cache em produção)
    codigosVerificacao[email] = { codigo, expiracao, verificado: false };

    console.log(`Código para ${email}: ${codigo}`); // Log para depuração

    // Enviar e-mail usando nodemailer
    await sendMail({
      to: email,
      subject: 'Seu Código de Verificação - DevLab',
      text: `Olá,\n\nSeu código de verificação é: ${codigo}\n\nEste código expira em 15 minutos.\n\nAtenciosamente,\nEquipe DevLab`,
      // html: `<p>Olá,</p><p>Seu código de verificação é: <strong>${codigo}</strong></p><p>Este código expira em 15 minutos.</p><p>Atenciosamente,<br/>Equipe DevLab</p>` // Exemplo com HTML
    });

    res.status(200).json({ message: 'Código de verificação enviado para o seu e-mail.' });

  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error);
    // Verifica erros específicos do nodemailer
    if (error.responseCode === 550 || error.code === 'EENVELOPE' || error.code === 'ESOCKET') {
       // Códigos comuns para endereço inválido ou problemas de conexão SMTP
       // Em produção, registre o erro detalhado para análise
       return res.status(400).json({ error: 'Não foi possível enviar o e-mail para este endereço. Verifique se ele está correto e tente novamente.' });
    }
    res.status(500).json({ error: 'Erro interno ao enviar código de verificação.', details: error.message });
  }
};

// Função para validar o código de verificação
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
      // Opcional: implementar lógica de tentativas para evitar brute-force
      return res.status(400).json({ error: 'Código de verificação inválido.' });
    }

    // Marca como verificado (importante se precisar checar no backend depois)
    codigosVerificacao[email].verificado = true;

    // Você *poderia* limpar o código aqui se não precisar mais dele, mas
    // manter o status 'verificado' pode ser útil se você *não* confiar
    // apenas no frontend para habilitar o botão de cadastro.
    // delete codigosVerificacao[email].codigo; // Remove só o código após sucesso

    res.status(200).json({ message: 'E-mail verificado com sucesso!' });

  } catch (error) {
    console.error('Erro ao validar código:', error);
    res.status(500).json({ error: 'Erro interno ao validar o código.', details: error.message });
  }
};


// --- SUAS FUNÇÕES CRUD EXISTENTES ---

// CREATE (com modificação conceitual para verificação)
exports.createUsuario = async (req, res) => {
  try {
    const { nome, cpf, email, telefone, genero, senha, tipo } = req.body;

    // ** Verificação do Status do Email (Opcional no Backend) **
    // A abordagem mais simples é confiar que o frontend só chamará esta rota
    // APÓS a validação bem-sucedida do código (como implementado no frontend).
    // Se precisar de segurança extra no backend:
    // const dadosCodigo = codigosVerificacao[email];
    // if (!dadosCodigo || !dadosCodigo.verificado) {
    //    return res.status(400).json({ error: 'E-mail não verificado ou verificação expirada.' });
    // }
    // Lembre-se que com armazenamento em memória, se o servidor reiniciar,
    // o status 'verificado' é perdido. Uma solução de BD/Cache é melhor para isso.
    // *************************************************************

    // Validações básicas (mantenha ou melhore as suas)
     if (!nome || !cpf || !email || !telefone || !genero || !senha || !tipo) {
       return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
     }
     // Adicione outras validações (formato CPF, telefone, força da senha, etc.)

    // Verificar se usuário já existe (já existia antes da verificação de email)
    const [existingRows] = await pool.query('SELECT id FROM usuarios WHERE email = ? OR cpf = ?', [email, cpf]);
    if (existingRows.length > 0) {
      // Limpa o código de verificação se o cadastro falhar por duplicidade
      delete codigosVerificacao[email];
      return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });
    }


    const hashedPassword = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, cpf, email, telefone, genero, senha, tipo, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [nome, cpf, email, telefone, genero, hashedPassword, tipo]
    );

    // Limpa os dados de verificação da memória após o cadastro bem-sucedido
    delete codigosVerificacao[email];

    res.status(201).json({ message: 'Cadastro realizado com sucesso!', id: result.insertId, nome, cpf, email, telefone, genero, tipo }); // Adiciona message

  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err); // Log mais detalhado
    // Limpar código em caso de erro geral também pode ser uma boa prática
    if (req.body.email) {
        delete codigosVerificacao[req.body.email];
    }
    res.status(500).json({ error: 'Erro interno ao cadastrar usuário.', details: err.message });
  }
};

// READ ALL
exports.getAllUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, cpf, email, telefone, genero, tipo, data_cadastro FROM usuarios'); // Evitar retornar senha
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários.', details: err.message });
  }
};

// READ ONE
exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, nome, cpf, email, telefone, genero, tipo, data_cadastro FROM usuarios WHERE id = ?', [id]); // Evitar retornar senha
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário.', details: err.message });
  }
};

// UPDATE
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, email, genero, telefone, senha, tipo } = req.body;

    // Verificar se o usuário existe
    const [usuarioRows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
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
    if (tipo !== undefined && tipo !== usuario.tipo) { camposParaAtualizar.tipo = tipo; }

    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      camposParaAtualizar.senha = hashedPassword;
    }

    const camposNomes = Object.keys(camposParaAtualizar);
    if (camposNomes.length === 0 && !senha) {
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
     // Verifica erro de chave única (ex: email ou cpf duplicado)
    if (err.code === 'ER_DUP_ENTRY') {
       return res.status(409).json({ error: 'Erro ao atualizar: E-mail ou CPF já está em uso por outro usuário.' });
    }
    res.status(500).json({ error: 'Erro interno ao atualizar usuário.', details: err.message });
  }
};

// DELETE
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover usuário:', err);
    // Adicionar verificação de chave estrangeira se necessário (ex: ER_ROW_IS_REFERENCED_2)
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ error: 'Não é possível remover o usuário pois ele possui registros relacionados (ex: candidaturas).' });
    }
    res.status(500).json({ error: 'Erro ao remover usuário.', details: err.message });
  }
};

// --- NOVAS FUNÇÕES PARA REDEFINIÇÃO DE SENHA COM CÓDIGO ---

/**
 * PASSO 1: Solicitar código de redefinição de senha.
 * (Chamado por POST /auth/forgot-password-send-code)
 */
exports.requestPasswordResetWithCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'O e-mail é obrigatório.' });
    }

    try {
        // 1. Verifica se o usuário EXISTE
        const [users] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

        // 2. Se não existir, retorna uma mensagem genérica (por segurança)
        if (users.length === 0) {
            console.log(`Tentativa de reset para email não encontrado: ${email}`);
            // Retorna 200 para não informar ao atacante se um e-mail existe ou não
            return res.status(200).json({ message: 'Se o e-mail estiver cadastrado em nosso sistema, você receberá um código de verificação.' });
        }

        // 3. Gerar e armazenar o código
        const codigo = gerarCodigoAleatorio();
        const expiracao = Date.now() + 15 * 60 * 1000; // 15 minutos
        codigosVerificacao[email] = { codigo, expiracao, verificado: false }; // Usamos o mesmo armazenamento

        console.log(`Código de REDEFINIÇÃO para ${email}: ${codigo}`);

        // 4. Enviar e-mail com o CÓDIGO
        await sendMail({
            to: email,
            subject: 'Redefinição de Senha - DevLab',
            text: `Olá,\n\nSeu código para redefinição de senha é: ${codigo}\n\nEste código expira em 15 minutos.\n\nAtenciosamente,\nEquipe DevLab`,
            html: `<p>Olá,</p><p>Seu código para redefinição de senha é: <strong>${codigo}</strong></p><p>Este código expira em 15 minutos.</p>`
        });

        res.status(200).json({ message: 'Código de verificação enviado para o seu e-mail.' });

    } catch (error) {
        console.error('Erro ao solicitar código de redefinição:', error);
        res.status(500).json({ error: 'Erro interno ao processar a solicitação.', details: error.message });
    }
};

/**
 * PASSO 2: Validar o código e redefinir a senha.
 * (Chamado por POST /auth/reset-password-with-code)
 */
exports.resetPasswordWithCode = async (req, res) => {
    const { email, codigo, password } = req.body;

    if (!email || !codigo || !password) {
        return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios.' });
    }

    try {
        // 1. Validar o código
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

        // 2. Se o código for válido, redefinir a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Atualiza a senha no banco
        const [result] = await pool.query(
            'UPDATE usuarios SET senha = ? WHERE email = ?',
            [hashedPassword, email]
        );

        if (result.affectedRows === 0) {
            // Isso não deve acontecer se a verificação de email no passo 1 funcionou
            return res.status(404).json({ error: 'Usuário não encontrado para atualizar a senha.' });
        }
        
        // 3. Limpar o código da memória
        delete codigosVerificacao[email];

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir senha com código:', error);
        res.status(500).json({ error: 'Erro interno ao redefinir a senha.', details: error.message });
    }
};

exports.updateUsuarioTipo = async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  // 1. Validação básica do tipo recebido
  if (!tipo || !['ADMIN', 'RH', 'CANDIDATO'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de usuário inválido ou não fornecido.' });
  }

  // 2. Verificação de segurança (Opcional, mas recomendado)
  // Se o seu 'authMiddleware' adicionar o usuário logado ao 'req.user',
  // é uma boa prática descomentar e adaptar o código abaixo
  // para impedir que um admin altere o seu próprio status.
  /*
  if (req.user && parseInt(req.user.id, 10) === parseInt(id, 10)) {
     return res.status(403).json({ error: 'Você não pode alterar seu próprio tipo de usuário.' });
  }
  */
  
  try {
    // 3. Atualiza o banco de dados
    const [result] = await pool.query(
      'UPDATE usuarios SET tipo = ? WHERE id = ?',
      [tipo, id]
    );

    // 4. Verifica se a atualização funcionou
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // 5. Resposta de sucesso
    res.json({ message: 'Tipo de usuário atualizado com sucesso!', id, novoTipo: tipo });

  } catch (err) {
    console.error('Erro ao atualizar tipo de usuário:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar tipo de usuário.', details: err.message });
  }
};  