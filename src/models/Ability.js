const mongoose = require('mongoose');

const abilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  requirements: String,
  category: {
    type: String,
    enum: ['Poderes de Ocultista', 'Poderes de Especialista', 'Poderes de Combatente', 'Poderes Paranormais', 'Poder de Origem'],
    index: true
  },
  // somente preenchidos se for uma origem
  origin: String, // nome da origem (ex: Acadêmico)
  trainedSkills: [String],
  associatedPower: String, // nome do poder concedido pela origem
  tags: [String],
  book: String, // livro onde aparece
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

abilitySchema.index({ name: 'text', description: 'text', requirements: 'text', origin: 'text', tags: 'text', trainedSkills: 'text' });

// index tags field as well so that queries combining $text and a regex
// on tags (used by the search route) can be planned successfully.
abilitySchema.index({ tags: 1 });

module.exports = mongoose.model('Ability', abilitySchema);
