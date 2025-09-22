const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware para proteger rotas
exports.protect = async (req, res, next) => {
  let token;

  // --- LOG 1: Verificando o cabeçalho de autorização ---
  console.log('--- Middleware "protect" ativado ---');
  console.log('Cabeçalhos da requisição:', req.headers);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Pega o token do cabeçalho (ex: "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // --- LOG 2: Token extraído ---
      console.log('Token extraído do cabeçalho:', token);

      // Verifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // --- LOG 3: Token decodificado com sucesso ---
      console.log('Token decodificado:', decoded);

      // Anexa o usuário à requisição (sem a senha)
      const connection = await db.getConnection();
      const [users] = await connection.query('SELECT id, nome, tipo FROM usuarios WHERE id = ?', [decoded.id]);
      connection.release();

      if (users.length > 0) {
        req.user = users[0];
        // --- LOG 4: Usuário encontrado no banco e anexado à requisição ---
        console.log('Usuário autenticado:', req.user);
        next(); // Continua para a próxima rota/controller
      } else {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }
    } catch (error) {
      // --- LOG 5: ERRO na verificação do token ---
      console.error('ERRO no middleware "protect":', error.message);
      return res.status(401).json({ error: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    // --- LOG 6: Nenhum token encontrado ---
    console.error('Nenhum token encontrado no cabeçalho de autorização.');
    return res.status(401).json({ error: 'Não autorizado, nenhum token fornecido.' });
  }
};

// Middleware para autorizar perfis (roles)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // --- LOG 7: Verificando autorização de perfil ---
    console.log(`--- Middleware "authorize" ativado para os perfis: [${roles.join(', ')}] ---`);
    console.log(`Verificando perfil do usuário: ${req.user ? req.user.tipo : 'NENHUM'}`);

    if (!req.user || !roles.includes(req.user.tipo)) {
      console.error(`Acesso negado. Usuário com perfil "${req.user ? req.user.tipo : 'N/A'}" tentou acessar rota restrita para "[${roles.join(', ')}]".`);
      return res.status(403).json({ error: 'Você não tem permissão para realizar esta ação.' });
    }
    
    console.log('Autorização concedida.');
    next();
  };
};