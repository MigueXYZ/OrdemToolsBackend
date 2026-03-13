const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  category: String,
  
  // Indica se o item é paranormal (true) ou comum (false)
  paranormal: {
    type: Boolean,
    required: true,
    default: false
  },
  
  // Espaço no inventário
  space: {
    type: Number,
    required: true,
    default: 1
  },
  
  tags: [String],
  book: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

itemSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });

// index tags for proper query planning when used with $text
itemSchema.index({ tags: 1 });

module.exports = mongoose.model('Item', itemSchema);