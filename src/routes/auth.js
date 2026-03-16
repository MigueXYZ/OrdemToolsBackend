// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Rota POST para registar um novo utilizador
router.post('/register', async (req, res) => {
  try {
    const { username, password, shownName, permissions } = req.body; // Adicionado shownName

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
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        // 4. Devolvemos o shownName para o Header do sistema Aero brilhar
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

module.exports = router;