// routes/characters.js
const express = require('express');
const router = express.Router();
const Character = require('../models/Character');
const auth = require('../middleware/auth'); // O teu middleware de autenticação

// 1. OBTER TODAS AS FICHAS DO UTILIZADOR LOGADO
router.get('/', auth(), async (req, res) => {
  try {
    // Procura apenas personagens cujo 'user' corresponda ao ID de quem fez o pedido
    const characters = await Character.find({ user: req.user.id })
      .populate('class', 'name')
      .populate('track', 'name')
      .populate('origin', 'name')
      .sort({ updatedAt: -1 }); // Mais recentes primeiro

    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. OBTER UMA FICHA ESPECÍFICA (COM TODOS OS POPULATES)
router.get('/:id', auth(), async (req, res) => {
  try {
    const character = await Character.findOne({ _id: req.params.id, user: req.user.id })
      .populate('class')
      .populate('track')
      .populate('attacks.weapon')
      .populate('inventory.items.item')
      .populate('abilities.ability')
      .populate('rituals.ritual');

    if (!character) {
      return res.status(404).json({ message: 'Ficha não encontrada ou não tens permissão.' });
    }

    res.json(character);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. CRIAR UMA NOVA FICHA
router.post('/', auth(), async (req, res) => {
  try {
    // Injeta o ID do utilizador logado nos dados da ficha antes de guardar
    const characterData = {
      ...req.body,
      user: req.user.id
    };

    const character = new Character(characterData);
    const saved = await character.save();
    
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. ATUALIZAR UMA FICHA EXISTENTE
router.patch('/:id', auth(), async (req, res) => {
  try {
    // O findOneAndUpdate garante que só edita se o ID da ficha e o ID do user coincidirem
    const updated = await Character.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true } // Devolve o documento novo e corre validações
    );

    if (!updated) {
      return res.status(404).json({ message: 'Ficha não encontrada ou não tens permissão para a editar.' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. APAGAR UMA FICHA
router.delete('/:id', auth(), async (req, res) => {
  try {
    const deleted = await Character.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Ficha não encontrada ou não tens permissão.' });
    }

    res.json({ message: 'Ficha apagada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;