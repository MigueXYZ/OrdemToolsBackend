const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// list with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tag = req.query.tag;
    const book = req.query.book;
    const paranormal = req.query.paranormal;
    const sort = req.query.sort || 'name';

    let query = {};
    if (tag) query.tags = { $elemMatch: { $regex: tag, $options: 'i' } };
    if (book) query.book = book;
    if (paranormal !== undefined) query.paranormal = paranormal === 'true';

    let sortOption = { name: 1 };
    if (sort === 'date') {
      sortOption = { createdAt: -1 };
    }

    const items = await Item.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Item.countDocuments(query);

    res.json({
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// metadata for filters
router.get('/meta', async (req, res) => {
  try {
    const tags = await Item.distinct('tags');
    const books = await Item.distinct('book');
    const paranormals = await Item.distinct('paranormal');
    res.json({ tags: tags.filter(Boolean), books: books.filter(Boolean), paranormals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = new Item(req.body);
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    Object.assign(item, req.body);
    item.updatedAt = new Date();
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;