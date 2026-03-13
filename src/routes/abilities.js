const express = require('express');
const router = express.Router();
const Ability = require('../models/Ability');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const tag = req.query.tag;
    const book = req.query.book;
    const sort = req.query.sort || 'name';

    let query = {};
    if (category) query.category = category;
    if (tag) query.tags = { $elemMatch: { $regex: tag, $options: 'i' } };
    if (book) query.book = book;

    let sortOption = { name: 1 };
    if (sort === 'date') {
      sortOption = { createdAt: -1 };
    }

    const abilities = await Ability.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Ability.countDocuments(query);

    res.json({
      data: abilities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// return distinct tags and books for UI filters
router.get('/meta', async (req, res) => {
  try {
    const tags = await Ability.distinct('tags');
    const books = await Ability.distinct('book');
    res.json({ tags: tags.filter(Boolean), books: books.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ability = await Ability.findById(req.params.id);
    if (!ability) return res.status(404).json({ message: 'Not found' });
    res.json(ability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const ability = new Ability(req.body);
    const saved = await ability.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const ability = await Ability.findById(req.params.id);
    if (!ability) return res.status(404).json({ message: 'Not found' });
    Object.assign(ability, req.body);
    ability.updatedAt = new Date();
    const updated = await ability.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Ability.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
