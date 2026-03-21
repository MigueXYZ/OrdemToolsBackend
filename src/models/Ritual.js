const mongoose = require('mongoose');

const ritualSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  circle: {
    type: Number,
    enum: [1,2,3,4],
    index: true
  },
  elements: [
    {
      type: String,
      enum: ['sangue','morte','energia','conhecimento','medo']
    }
  ],
  duration: String,
  tags: [String],
  book: String,
  execution: { type: String },
  range: { type: String },
  target: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ritualSchema.index({ name: 'text', description: 'text', tags: 'text', elements: 'text' });

// ensure tags are indexed for combined text/regex searches
ritualSchema.index({ tags: 1 });

module.exports = mongoose.model('Ritual', ritualSchema);
