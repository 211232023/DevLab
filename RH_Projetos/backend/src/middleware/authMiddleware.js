const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
  let token;

  console.log('--- Middleware "protect" ativado ---');
  console.log('Cabeçalhos da requisição:', req.headers);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      console.log('Token extraído do cabeçalho:', token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('Token decodificado:', decoded);

      const connection = await db.getConnection();
      const [users] = await connection.query('SELECT id, nome, tipo FROM usuarios WHERE id = ?', [decoded.id]);
      connection.release();

      if (users.length > 0) {
        // CORREÇÃO: Alterado de req.user para req.usuario
        req.usuario = users[0]; 
        // CORREÇÃO: Alterado de req.user para req.usuario (no seu paste já estava correto)
        console.log('Usuário autenticado:', req.usuario);
        next(); 
      } else {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }
    } catch (error) {
      console.error('ERRO no middleware "protect":', error.message);
      return res.status(401).json({ error: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    console.error('Nenhum token encontrado no cabeçalho de autorização.');
    return res.status(401).json({ error: 'Não autorizado, nenhum token fornecido.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {

    console.log(`--- Middleware "authorize" ativado para os perfis: [${roles.join(', ')}] ---`);
    
    // CORREÇÃO: Alterado de req.user para req.usuario
    console.log(`Verificando perfil do usuário: ${req.usuario ? req.usuario.tipo : 'NENHUM'}`);

    // CORREÇÃO: Alterado de req.user para req.usuario
    if (!req.usuario || !roles.includes(req.usuario.tipo)) {
      // CORREÇÃO (Opcional, mas recomendado): Alterado de req.user para req.usuario
      console.error(`Acesso negado. Usuário com perfil "${req.usuario ? req.usuario.tipo : 'N/A'}" tentou acessar rota restrita para "[${roles.join(', ')}]".`);
      return res.status(403).json({ error: 'Você não tem permissão para realizar esta ação.' });
    }
    
    console.log('Autorização concedida.');
    next();
  };
};