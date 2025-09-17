const path = require('path');
const pool = require(path.resolve(__dirname, '../config/db'));
const bcrypt = require('bcrypt');

// CREATE
exports.createUsuario = async (req, res) => {
  try {
    const { nome, cpf, email, telefone, genero, senha, tipo } = req.body;
    
    const hashedPassword = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, cpf, email, telefone, genero, senha, tipo, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [nome, cpf, email, telefone, genero, hashedPassword, tipo]
    );
    res.status(201).json({ id: result.insertId, nome, cpf, email, telefone, genero, tipo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

// READ ALL
exports.getAllUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// READ ONE
exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// UPDATE 
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    // Adicionado "tipo" para ser extraído do corpo da requisição
    const { nome, cpf, email, genero, telefone, senha, tipo } = req.body;

    const [usuarioRows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (usuarioRows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const usuario = usuarioRows[0];
    const updatedUsuario = {
      nome: nome !== undefined ? nome : usuario.nome,
      cpf: cpf !== undefined ? cpf : usuario.cpf,
      email: email !== undefined ? email : usuario.email,
      genero: genero !== undefined ? genero : usuario.genero,
      telefone: telefone !== undefined ? telefone : usuario.telefone,
      tipo: tipo !== undefined ? tipo : usuario.tipo, // Adicionado
    };

    // Query e parâmetros atualizados para incluir o campo "tipo"
    let query = 'UPDATE usuarios SET nome = ?, cpf = ?, email = ?, genero = ?, telefone = ?, tipo = ?';
    const queryParams = [
        updatedUsuario.nome, 
        updatedUsuario.cpf, 
        updatedUsuario.email, 
        updatedUsuario.genero, 
        updatedUsuario.telefone, 
        updatedUsuario.tipo
    ];

    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      query += ', senha = ?';
      queryParams.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    queryParams.push(id);

    await pool.query(query, queryParams);

    // Retorna o usuário atualizado (sem a senha)
    res.json({ id: parseInt(id, 10), ...updatedUsuario });

  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
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
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
};