const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  section: {
    type: String,
    enum: ['Personagem', 'Combate', 'Perícias', 'Sanidade', 'Investigação', 'Equipamento', 'Geral'],
    index: true
  },
  content: String,
  subsection: String,
  tags: [String],
  source: String,
  pageReference: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ruleSchema.index({ title: 'text', content: 'text', tags: 'text' });

// text + regex combination demands an index on tags
ruleSchema.index({ tags: 1 });

module.exports = mongoose.model('Rule', ruleSchema);
