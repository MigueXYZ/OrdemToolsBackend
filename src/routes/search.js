const express = require('express');
const router = express.Router();
const Ability = require('../models/Ability');
const Ritual = require('../models/Ritual');
const Rule = require('../models/Rule');
const Item = require('../models/Item');
const Class = require('../models/Class');
const Track = require('../models/Track');
const Weapon = require('../models/Weapon');

// escape a string for use in a regex
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// helper to fetch distinct tags across all collections
async function getTags(prefix) {
  const regex = new RegExp(`^${escapeRegex(prefix)}`, 'i');
  const [abilityTags, ritualTags, ruleTags, itemTags, classTags, trackTags, weaponTags] = await Promise.all([
    Ability.distinct('tags', { tags: regex }),
    Ritual.distinct('tags', { tags: regex }),
    Rule.distinct('tags', { tags: regex }),
    Item.distinct('tags', { tags: regex }),
    Class.distinct('tags', { tags: regex }),
    Track.distinct('tags', { tags: regex }),
    Weapon.distinct('tags', { tags: regex }),
  ]);
  return Array.from(new Set([...abilityTags, ...ritualTags, ...ruleTags, ...itemTags, ...classTags, ...trackTags, ...weaponTags]));
}

router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    const type = req.query.type;
    const limit = parseInt(req.query.limit) || 50;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    // build a smarter text search string
    // when the user provides more than one word, perform a phrase search
    // this prevents a multi-word query from matching just a single term ("poder" as in the bug report)
    const tokens = query.trim().split(/\s+/).filter(Boolean);
    let textSearchString = query;
    if (tokens.length > 1) {
      // wrap the whole query in quotes to force an exact phrase match
      textSearchString = `"${query}"`;
    }

    const searchOptions = { $text: { $search: textSearchString } };

    let results = { abilities: [], rituals: [], rules: [], items: [], classes: [], tracks: [], weapons: [] };

    // if a multi-word query is used we already wrapped it as a phrase above.
    // we also always OR with an exact tag match so that searching for a specific tag
    // (even if it contains spaces) returns the relevant documents.
    // build a regex that matches tags starting with the supplied query
    const tagRegex = new RegExp(`^${escapeRegex(query)}`, 'i');
    const tagFilter = { tags: tagRegex };

    // if the frontend requested a tag-only search (usually when the user
    // selects an autocomplete suggestion) we skip the text index entirely
    let onlyByTag = req.query.tagOnly === 'true';

    // automatically treat exact tag queries as tag-only so manual typing
    // still behaves sensibly
    if (!onlyByTag) {
      const matchingTags = await getTags(query);
      if (matchingTags.some(t => t.toLowerCase() === query.toLowerCase())) {
        onlyByTag = true;
      }
    }

    if (!type || type === 'abilities') {
      const q = onlyByTag ? tagFilter : { $or: [searchOptions, tagFilter] };
      results.abilities = await Ability.find(q).limit(limit);
    }

    if (!type || type === 'rituals') {
      const q = onlyByTag ? tagFilter : { $or: [searchOptions, tagFilter] };
      results.rituals = await Ritual.find(q).limit(limit);
    }

    if (!type || type === 'rules') {
      const q = onlyByTag ? tagFilter : { $or: [searchOptions, tagFilter] };
      results.rules = await Rule.find(q).limit(limit);
    }

    if (!type || type === 'items') {
      const q = onlyByTag ? tagFilter : { $or: [searchOptions, tagFilter] };
      results.items = await Item.find(q).limit(limit);
    }

    if (!type || type === 'classes') {
      const q = onlyByTag ? tagFilter : { $or: [searchOptions, tagFilter] };
      results.classes = await Class.find(q).populate('abilities').limit(limit);
    }

    if (!type || type === 'tracks') {
      const q = onlyByTag ? tagFilter : { $or: [searchOptions, tagFilter] };
      results.tracks = await Track.find(q).populate('class').populate('abilities').limit(limit);
    }

    if (!type || type === 'weapons') {
      const q = onlyByTag ? tagFilter : { $or: [searchOptions, tagFilter] };
      results.weapons = await Weapon.find(q).limit(limit);
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
        total: results.abilities.length + results.rituals.length + results.rules.length + results.items.length + results.classes.length + results.tracks.length + results.weapons.length
      }
    });
  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ message: error.message });
  }
});

// endpoint used by the frontend for autocomplete suggestions
router.get('/tags', async (req, res) => {
  try {
    const prefix = req.query.q || '';
    if (!prefix) {
      return res.json({ tags: [] });
    }

    const tags = await getTags(prefix);
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
