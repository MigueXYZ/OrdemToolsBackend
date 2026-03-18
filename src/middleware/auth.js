// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware de Autenticação e Autorização
 * @param {Array|String} requiredPermissions - Permissão ou lista de permissões necessárias
 */
const auth = (requiredPermissions = []) => {
  return (req, res, next) => {
    // 1. Ler o token do cabeçalho
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
      // 2. Tratar o prefixo Bearer
      const token = authHeader.replace('Bearer ', '');
      
      // 3. Verificar validade
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Anexamos o utilizador ao request
      req.user = decoded.user;

      // 4. Lógica de Autorização (Permissões)
      if (requiredPermissions.length > 0) {
        // Garantimos que trabalhamos sempre com um array para facilitar a comparação
        const permsNeeded = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
        
        // CORREÇÃO: Usar um array vazio como fallback caso req.user.permissions seja undefined em tokens velhos
        const userPerms = req.user.permissions || [];
        
        // Verificamos se o utilizador tem PELO MENOS UMA das permissões necessárias
        const hasPermission = userPerms.some(p => permsNeeded.includes(p));

        if (!hasPermission) {
          return res.status(403).json({ message: 'Acesso interdito. Não tens autorização para esta ação.' });
        }
      }

      next();
    } catch (err) {
      console.error('Erro no middleware de auth:', err.message); // Facilita o debug no terminal do servidor
      res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
  };
};

module.exports = auth;