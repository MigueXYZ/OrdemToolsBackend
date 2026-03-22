const mongoose = require('mongoose');

const originSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  powerName: { type: String, required: true },
  powerDescription: { type: String, required: true },
  // Se quiseres, podes até adicionar as perícias que a origem dá:
   trainedSkills: [{ type: String }] 
}, { timestamps: true });

module.exports = mongoose.model('Origin', originSchema);