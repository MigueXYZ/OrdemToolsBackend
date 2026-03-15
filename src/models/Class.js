const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  
  // Pontos de Vida (PV)
  hp: {
    initial: String,
    perLevel: String
  },
  
  // Pontos de Esforço (PE)
  ep: {
    initial: String,
    perLevel: String
  },
  
  // Sanidade (SAN)
  san: {
    initial: String,
    perLevel: String
  },
  
  trainedSkills: String,
  proficiencies: String,
  
  book: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

classSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Class', classSchema);