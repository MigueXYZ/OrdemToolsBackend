const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  book: String, // livro onde aparece
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

classSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Class', classSchema);