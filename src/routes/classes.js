const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

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

// return distinct books for UI filters
router.get('/meta', async (req, res) => {
  try {
    const books = await Class.distinct('book');
    res.json({ books: books.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;