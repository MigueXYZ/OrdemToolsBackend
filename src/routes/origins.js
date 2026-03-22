const express = require('express');
const router = express.Router();
const Origin = require('../models/Origin');

// GET: Obter todas as Origens
router.get('/', async (req, res) => {
  try {
    const origins = await Origin.find().sort({ name: 1 }); // Ordena alfabeticamente
    res.status(200).json({ success: true, count: origins.length, data: origins });
  } catch (error) {
    console.error('Erro ao listar origens:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
});

// GET: Obter metadados das origens (ex: livros) para os filtros
router.get('/meta', async (req, res) => {
  try {
    // Procura todos os livros diferentes associados a origens na base de dados
    const books = await Origin.distinct('book');
    
    // Devolve os dados (filter tira possíveis resultados nulos)
    res.status(200).json({ 
      success: true, 
      books: books.filter(Boolean),
      tags: [] // As origens por agora não têm tags, mas mandamos vazio para o Frontend não dar erro
    });
  } catch (error) {
    console.error('Erro ao obter metadados das origens:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
});

// GET: Obter uma Origem específica por ID
router.get('/:id', async (req, res) => {
  try {
    const origin = await Origin.findById(req.params.id);
    if (!origin) {
      return res.status(404).json({ success: false, error: 'Origem não encontrada' });
    }
    res.status(200).json({ success: true, data: origin });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST: Criar uma nova Origem
router.post('/', async (req, res) => {
  try {
    const origin = await Origin.create(req.body);
    res.status(201).json({ success: true, data: origin });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT: Atualizar uma Origem
router.put('/:id', async (req, res) => {
  try {
    const origin = await Origin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!origin) {
      return res.status(404).json({ success: false, error: 'Origem não encontrada' });
    }
    res.status(200).json({ success: true, data: origin });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE: Apagar uma Origem
router.delete('/:id', async (req, res) => {
  try {
    const origin = await Origin.findByIdAndDelete(req.params.id);
    if (!origin) {
      return res.status(404).json({ success: false, error: 'Origem não encontrada' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;