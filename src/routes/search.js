const express = require('express');
const router = express.Router();
const Ability = require('../models/Ability');
const Ritual = require('../models/Ritual');
const Rule = require('../models/Rule');
const Item = require('../models/Item');
const Class = require('../models/Class');
const Track = require('../models/Track');
const Weapon = require('../models/Weapon');
const Threat = require('../models/Threat');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getTags(prefix) {
  const regex = new RegExp(`^${escapeRegex(prefix)}`, 'i');
  const [abilityTags, ritualTags, ruleTags, itemTags, classTags, trackTags, weaponTags, threatTags] = await Promise.all([
    Ability.distinct('tags', { tags: regex }),
    Ritual.distinct('tags', { tags: regex }),
    Rule.distinct('tags', { tags: regex }),
    Item.distinct('tags', { tags: regex }),
    Class.distinct('tags', { tags: regex }),
    Track.distinct('tags', { tags: regex }),
    Weapon.distinct('tags', { tags: regex }),
    Threat.distinct('tags', { tags: regex })
  ]);
  return Array.from(new Set([...abilityTags, ...ritualTags, ...ruleTags, ...itemTags, ...classTags, ...trackTags, ...weaponTags, ...threatTags]));
}

router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    const type = req.query.type;
    const limit = parseInt(req.query.limit) || 50;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const cleanQuery = escapeRegex(query.trim());
    const searchRegex = new RegExp(cleanQuery, 'i'); // 'i' para ignorar maiúsculas/minúsculas

    // A tua pesquisa estrita: Apenas Nome/Título e Descrição (ou Content para regras)
    const textSearchCondition = {
      $or: [
        { name: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex }
      ]
    };

    // A pesquisa por Tags continua igual
    const tagFilter = { tags: new RegExp(`^${cleanQuery}`, 'i') };

    let onlyByTag = req.query.tagOnly === 'true';

    if (!onlyByTag) {
      const matchingTags = await getTags(query);
      if (matchingTags.some(t => t.toLowerCase() === query.toLowerCase())) {
        onlyByTag = true;
      }
    }

    // A condição final para procurar na base de dados
    const finalCondition = onlyByTag 
      ? tagFilter 
      : { $or: [ textSearchCondition, tagFilter ] };

    let results = { abilities: [], rituals: [], rules: [], items: [], classes: [], tracks: [], weapons: [], threats: [] };

    // Disparamos as pesquisas apenas nas coleções pedidas
    if (!type || type === 'abilities') {
      results.abilities = await Ability.find(finalCondition).limit(limit).lean();
    }
    if (!type || type === 'rituals') {
      results.rituals = await Ritual.find(finalCondition).limit(limit).lean();
    }
    if (!type || type === 'rules') {
      results.rules = await Rule.find(finalCondition).limit(limit).lean();
    }
    if (!type || type === 'items') {
      results.items = await Item.find(finalCondition).limit(limit).lean();
    }
    if (!type || type === 'classes') {
      // Populate falha com .lean() direto se não tivermos cuidado, mas aqui é seguro pois não alteramos os docs
      results.classes = await Class.find(finalCondition).populate('abilities').limit(limit).lean();
    }
    if (!type || type === 'tracks') {
      results.tracks = await Track.find(finalCondition).populate('class').populate('abilities').limit(limit).lean();
    }
    if (!type || type === 'weapons') {
      results.weapons = await Weapon.find(finalCondition).limit(limit).lean();
    }
    if (!type || type === 'threats') {
      results.threats = await Threat.find(finalCondition).limit(limit).lean();
    }

    res.json({
      query,
      results,
      count: {
        abilities: results.abilities.length,
        rituals: results.rituals.length,
        rules: results.rules.length,
        items: results.items.length,
        classes: results.classes.length,
        tracks: results.tracks.length,
        weapons: results.weapons.length,
        threats: results.threats.length,
        total: results.abilities.length + results.rituals.length + results.rules.length + results.items.length + results.classes.length + results.tracks.length + results.weapons.length + results.threats.length
      }
    });

  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const prefix = req.query.q || '';
    if (!prefix) return res.json({ tags: [] });
    
    const tags = await getTags(prefix);
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;