// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Rota POST para registar um novo utilizador
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar se o nome de utilizador já existe
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Este utilizador já existe.' });
    }

    user = new User({ username, password });

    // Encriptar a palavra-passe antes de a guardar na base de dados
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

    // Verificar se o utilizador existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // Comparar a palavra-passe submetida com a versão encriptada da base de dados
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // Criar a carga de dados (payload) e assinar o JWT
    const payload = {
      user: { id: user.id }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // Define que o token expira ao fim de 24 horas
      (err, token) => {
        if (err) throw err;
        res.json({ token, username: user.username });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
});

module.exports = router;