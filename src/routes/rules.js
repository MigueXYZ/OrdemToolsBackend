const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const section = req.query.section;
    const tag = req.query.tag;
    const book = req.query.book;
    const sort = req.query.sort || 'name';

    let query = {};
    if (section) query.section = section;
    if (tag) query.tags = { $elemMatch: { $regex: tag, $options: 'i' } };
    if (book) query.book = book;

    let sortOption = { section: 1, title: 1 };
    if (sort === 'date') {
      sortOption = { createdAt: -1 };
    }

    const rules = await Rule.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Rule.countDocuments(query);

    res.json({
      data: rules,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/meta', async (req, res) => {
  try {
    const tags = await Rule.distinct('tags');
    const books = await Rule.distinct('source');
    // rules use `source` for book-like info; include non-empty
    res.json({ tags: tags.filter(Boolean), books: books.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Not found' });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const rule = new Rule(req.body);
    const saved = await rule.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Not found' });
    Object.assign(rule, req.body);
    rule.updatedAt = new Date();
    const updated = await rule.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Rule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
