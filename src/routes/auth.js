// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Rota POST para registar um novo utilizador
router.post('/register', async (req, res) => {
  try {
    const { username, password, shownName } = req.body; // Adicionado shownName

    // 1. Verificar se o nome de utilizador já existe
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Este utilizador já existe.' });
    }

    // 2. Criar instância (a password será encriptada automaticamente se usares o pre-save hook 
    // ou manualmente como tens abaixo)
    user = new User({
      username,
      password,
      shownName: shownName || username // Fallback caso não enviem um nome de exibição
    });

    // Encriptação manual (Caso não tenhas o pre-save hook no model)
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ message: 'Utilizador registado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
});

// Rota POST para efetuar o Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Verificar se o utilizador existe
    // NOTA: Precisamos de usar .select('+password') porque no model definimos select: false
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // 2. Comparar passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Criar payload com informações úteis para o Frontend (incluindo permissões)
    const payload = {
      user: {
        id: user.id,
        permissions: user.permissions
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          username: user.username,
          shownName: user.shownName,
          permissions: user.permissions
        });
      }

    );
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
});

router.put('/update-permissions/:id', auth('admin'), async (req, res) => {
  try {
    const { permissions, shownName } = req.body;

    // Atualiza o utilizador pelo ID fornecido na URL
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { permissions, shownName } },
      { new: true } // Devolve o documento já atualizado
    );

    if (!updatedUser) return res.status(404).json({ message: 'Utilizador não encontrado.' });

    res.json({ message: 'Utilizador atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar.', error: error.message });
  }
});


// ROTA: PUT /api/auth/updatedetails
// DESC: Atualiza os detalhes do perfil do utilizador (ex: shownName)
// ACESSO: Privado (requer token válido)
router.put('/updatedetails', auth(), async (req, res) => { // <-- ATENÇÃO AQUI: auth() com parênteses
  try {
    const { shownName } = req.body;

    // O teu middleware garante que req.user existe (via decoded.user)
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    // Atualiza o nome de exibição
    user.shownName = shownName || user.shownName;

    // Guarda na base de dados
    await user.save();

    // Devolve os dados limpos
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        shownName: user.shownName,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar detalhes:', error);
    res.status(500).json({ error: 'Erro no servidor ao atualizar o perfil.' });
  }
});

router.get('/users', auth(['admin']), async (req, res) => {
  try {
    // Procura todos os utilizadores, mas exclui a password dos resultados
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao procurar utilizadores:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// ROTA: PUT /api/auth/users/:id/reset-password
// DESC: Redefine a palavra-passe de um utilizador gerando uma aleatória
// ACESSO: Privado (Apenas Admin)
router.put('/users/:id/reset-password', auth(['admin']), async (req, res) => {
  try {
    // Gera uma palavra-passe aleatória de 8 caracteres (letras e números)
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Encripta a nova palavra-passe
    const bcrypt = require('bcrypt'); // Garante que tens o bcrypt importado no topo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Atualiza o utilizador
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'Utilizador não encontrado.' });

    // Devolvemos a palavra-passe em texto limpo UMA ÚNICA VEZ para o admin copiar
    res.json({ message: 'Palavra-passe redefinida com sucesso.', tempPassword });
  } catch (error) {
    console.error('Erro ao redefinir palavra-passe:', error);
    res.status(500).json({ message: 'Erro interno ao redefinir palavra-passe.' });
  }
});

// ROTA: DELETE /api/auth/users/:id
// DESC: Apaga um utilizador permanentemente da base de dados
// ACESSO: Privado (Apenas Admin)
router.delete('/users/:id', auth(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    
    res.json({ message: 'Utilizador removido com sucesso do sistema.' });
  } catch (error) {
    console.error('Erro ao apagar utilizador:', error);
    res.status(500).json({ message: 'Erro interno ao apagar conta.' });
  }
});

// ROTA: PUT /api/auth/change-password
// DESC: O próprio utilizador altera a sua palavra-passe
// ACESSO: Privado (requer token válido)
router.put('/change-password', auth(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Precisamos do .select('+password') porque a password está oculta por defeito no model
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // 1. Verificar se a palavra-passe atual está correta
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'A palavra-passe atual está incorreta.' });
    }

    // 2. Encriptar a nova palavra-passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 3. Guardar na base de dados
    await user.save();

    res.status(200).json({ message: 'Palavra-passe alterada com sucesso.' });
  } catch (error) {
    console.error('Erro ao alterar palavra-passe:', error);
    res.status(500).json({ message: 'Erro interno ao alterar a palavra-passe.' });
  }
});

module.exports = router;