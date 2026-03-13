// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Ler o token do cabeçalho do pedido
  const token = req.header('Authorization');

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    // O formato padrão do HTTP é enviar "Bearer <token>"
    const tokenFormatado = token.replace('Bearer ', '');
    
    // Verificar a validade e a assinatura do token
    const decoded = jwt.verify(tokenFormatado, process.env.JWT_SECRET);
    
    // Anexar os dados do utilizador ao pedido para uso futuro, se necessário
    req.user = decoded.user;
    next(); // Passa a barreira de segurança e avança para a rota principal
  } catch (err) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};