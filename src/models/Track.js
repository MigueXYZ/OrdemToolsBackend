const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  abilities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ability',
    required: true
  }],
  description: String,
  book: String, // livro onde aparece
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure exactly 4 abilities
trackSchema.pre('save', function(next) {
  if (this.abilities.length !== 4) {
    return next(new Error('A trilha deve ter exatamente 4 poderes'));
  }
  next();
});

trackSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Track', trackSchema);