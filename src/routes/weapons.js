const express = require('express');
const router = express.Router();
const Weapon = require('../models/Weapon');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const proficiency = req.query.proficiency;
    const type = req.query.type;
    const book = req.query.book;
    const sort = req.query.sort || 'name';

    let query = {};
    if (proficiency) query.proficiency = proficiency;
    if (type) query.type = type;
    if (book) query.book = book;

    let sortOption = { name: 1 };
    if (sort === 'date') {
      sortOption = { createdAt: -1 };
    }

    const weapons = await Weapon.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Weapon.countDocuments(query);

    res.json({
      data: weapons,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// return distinct values for UI filters
router.get('/meta', async (req, res) => {
  try {
    const proficiencies = await Weapon.distinct('proficiency');
    const types = await Weapon.distinct('type');
    const categories = await Weapon.distinct('category');
    const books = await Weapon.distinct('book');
    const tags = await Weapon.distinct('tags');
    res.json({ 
      proficiencies: proficiencies.filter(Boolean), 
      types: types.filter(Boolean),
      categories: categories.filter(Boolean),
      books: books.filter(Boolean),
      tags: tags.filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const newWeapon = new Weapon(req.body);
    await newWeapon.save();
    res.status(201).json(newWeapon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const weapon = await Weapon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!weapon) {
      return res.status(404).json({ message: 'Weapon not found' });
    }
    res.json(weapon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;