const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  vd: {
    type: Number,
    required: true
  },
  description: String,
  type: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  elements: [{
    type: String
  }],
  
  // Presença Perturbadora (Opcional, pois humanos/animais não têm)
  presence: {
    dt: Number,
    damage: String,
    immunityNex: Number
  },
  
  // Sentidos e Iniciativa
  senses: {
    perception: String,
    initiative: String,
    notes: String
  },
  
  defense: {
    type: Number,
    required: true
  },
  
  savingThrows: {
    fortitude: String,
    reflexes: String,
    will: String
  },
  
  hp: {
    total: { type: Number, required: true },
    bloodied: Number
  },
  
  immunities: [String],
  resistances: [String],
  vulnerabilities: [String],
  
  attributes: {
    agi: { type: Number, required: true, default: 0 },
    for: { type: Number, required: true, default: 0 },
    int: { type: Number, required: true, default: 0 },
    pre: { type: Number, required: true, default: 0 },
    vig: { type: Number, required: true, default: 0 }
  },
  
  skills: [{
    name: String,
    value: String
  }],
  
  movement: String,
  
  passives: [{
    name: String,
    description: String
  }],
  
  actions: [{
    actionType: {
      type: String,
      enum: ['Livre', 'Movimento', 'Padrão', 'Completa', 'Reação']
    },
    name: String,
    description: String,
    test: String,
    damage: String
  }],
  
  enigmaOfFear: {
    hasEnigma: { type: Boolean, default: false },
    description: String,
    mechanics: String
  },

  disturbingPresence: {
    hasDisturbingPresence: { type: Boolean, default: false },
    dt: Number,
    damage: String,
    immunityNex: Number
  },
  
  book: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Índice de texto para pesquisas na barra de pesquisa do frontend
threatSchema.index({ 
  name: 'text', 
  description: 'text', 
  'passives.description': 'text',
  'actions.name': 'text' 
});

module.exports = mongoose.model('Threat', threatSchema);