const mongoose = require('mongoose');

const originSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  powerName: { type: String, required: true },
  powerDescription: { type: String, required: true },
  trainedSkills: [{ type: String }],
  book: { type: String }, // Para saber de onde veio a origem (se for do livro base, do suplemento, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Origin', originSchema);