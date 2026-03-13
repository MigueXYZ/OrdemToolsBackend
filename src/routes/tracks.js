const express = require('express');
const router = express.Router();
const Track = require('../models/Track');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const classId = req.query.class;
    const book = req.query.book;
    const sort = req.query.sort || 'name';

    let query = {};
    if (classId) query.class = classId;
    if (book) query.book = book;

    let sortOption = { name: 1 };
    if (sort === 'date') {
      sortOption = { createdAt: -1 };
    }

    const tracks = await Track.find(query)
      .populate('class')
      .populate('abilities')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Track.countDocuments(query);

    res.json({
      data: tracks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// return distinct books for UI filters
router.get('/meta', async (req, res) => {
  try {
    const books = await Track.distinct('book');
    res.json({ books: books.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const newTrack = new Track(req.body);
    await newTrack.save();
    await newTrack.populate('class abilities');
    res.status(201).json(newTrack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;