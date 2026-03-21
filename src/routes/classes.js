const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const book = req.query.book;
    const sort = req.query.sort || 'name';

    let query = {};
    if (book) query.book = book;

    let sortOption = { name: 1 };
    if (sort === 'date') {
      sortOption = { createdAt: -1 };
    }

    const classes = await Class.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Class.countDocuments(query);

    res.json({
      data: classes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/meta', async (req, res) => {
  try {
    const books = await Class.distinct('book');
    res.json({ books: books.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth(), async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', auth(), async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedClass) return res.status(404).json({ message: 'Classe não encontrada' });
    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth(), async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ message: 'Classe não encontrada' });
    res.json({ message: 'Classe removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;