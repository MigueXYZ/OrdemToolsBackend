const express = require('express');
const router = express.Router();
const Threat = require('../models/Threat');
const auth = require('../middleware/auth');

// Obter lista de ameaças com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const element = req.query.element;
    const size = req.query.size;
    const minVd = req.query.minVd;
    const maxVd = req.query.maxVd;
    const book = req.query.book;
    const sort = req.query.sort || 'name';

    let query = {};
    if (type) query.type = type;
    if (element) query.elements = element; // Procura se o elemento está no array
    if (size) query.size = size;
    if (book) query.book = book;
    
    // Filtro de Valor de Desafio (VD) por intervalo
    if (minVd || maxVd) {
      query.vd = {};
      if (minVd) query.vd.$gte = parseInt(minVd);
      if (maxVd) query.vd.$lte = parseInt(maxVd);
    }

    let sortOption = { name: 1 };
    if (sort === 'vd') sortOption = { vd: 1, name: 1 };
    if (sort === '-vd') sortOption = { vd: -1, name: 1 };
    if (sort === 'date') sortOption = { createdAt: -1 };

    const threats = await Threat.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Threat.countDocuments(query);

    res.json({
      data: threats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Retornar valores únicos para preencher os filtros na UI
router.get('/meta', async (req, res) => {
  try {
    const types = await Threat.distinct('type');
    const elements = await Threat.distinct('elements');
    const sizes = await Threat.distinct('size');
    const books = await Threat.distinct('book');
    const vds = await Threat.distinct('vd');
    
    res.json({ 
      types: types.filter(Boolean),
      elements: elements.filter(Boolean),
      sizes: sizes.filter(Boolean),
      books: books.filter(Boolean),
      vds: vds.filter(v => v !== null).sort((a, b) => a - b)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter uma ameaça específica pelo ID
router.get('/:id', async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) {
      return res.status(404).json({ message: 'Threat not found' });
    }
    res.json(threat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar nova ameaça
router.post('/', auth, async (req, res) => {
  try {
    const newThreat = new Threat(req.body);
    await newThreat.save();
    res.status(201).json(newThreat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Atualizar ameaça existente
router.patch('/:id', auth, async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const threat = await Threat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!threat) {
      return res.status(404).json({ message: 'Threat not found' });
    }
    res.json(threat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deletar ameaça
router.delete('/:id', auth, async (req, res) => {
  try {
    const threat = await Threat.findByIdAndDelete(req.params.id);
    if (!threat) {
      return res.status(404).json({ message: 'Threat not found' });
    }
    res.json({ message: 'Threat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;