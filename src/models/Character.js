// models/Character.js
const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  // Vínculo com o jogador (Quem é o dono desta ficha)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Identificação Básica
  name: { type: String, required: true },
  playerName: { type: String },
  
  // Progressão
  nex: { type: Number, default: 5 },
  level: { type: Number, default: 1 },
  useLevel: { type: Boolean, default: false }, // O tal toggle que pediste
  
  // Estrutura
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
  origin: { type: String }, // Pode ser String ou referência a um modelo "Origin" se criares depois
  
  // Hierarquia na Ordem
  patente: { type: String, default: 'Recruta' },
  prestigio: { type: Number, default: 0 },
  
  // Atributos
  attributes: {
    agi: { type: Number, default: 1 },
    for: { type: Number, default: 1 },
    int: { type: Number, default: 1 },
    pre: { type: Number, default: 1 },
    vig: { type: Number, default: 1 }
  },
  
  // Vidas e Estatísticas (Suporta valores atuais, temporários e override do maximo automático)
  stats: {
    hp: { current: { type: Number, default: 0 }, temp: { type: Number, default: 0 }, overrideMax: { type: Number, default: null } },
    ep: { current: { type: Number, default: 0 }, temp: { type: Number, default: 0 }, overrideMax: { type: Number, default: null } },
    san: { current: { type: Number, default: 0 }, temp: { type: Number, default: 0 }, overrideMax: { type: Number, default: null } }
  },
  
  // Combate
  combat: {
    defenseEquipment: { type: Number, default: 0 },
    defenseOther: { type: Number, default: 0 },
    protections: { type: String, default: '' },
    resistances: { type: String, default: '' },
    movement: { type: String, default: '9m' }
  },
  
  // Perícias (Lista dinâmica para permitir customização, guardando o grau de treino e bónus extra)
  skills: [{
    name: { type: String },
    trainingDegree: { type: Number, default: 0 }, // 0 (Destreinado), 5 (Treinado), 10 (Veterano), 15 (Expert)
    otherBonus: { type: Number, default: 0 }
  }],
  
  // Ataques / Armas Rápidas
  attacks: [{
    weapon: { type: mongoose.Schema.Types.ObjectId, ref: 'Weapon' },
    customName: { type: String },
    attackBonus: { type: Number, default: 0 },
    damageOverride: { type: String },
    criticalOverride: { type: String }
  }],
  
  // Inventário e Carga
  inventory: {
    items: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      customName: { type: String },
      quantity: { type: Number, default: 1 },
      spaceOverride: { type: Number, default: null },
      categoryOverride: { type: String, default: null }
    }],
    creditLimit: { type: String, default: '' },
    maxWeightOverride: { type: Number, default: null } // Permite ignorar o limite de Força * 5
  },
  
  // Habilidades e Rituais (Ligação aos teus modelos existentes)
  abilities: [{
    ability: { type: mongoose.Schema.Types.ObjectId, ref: 'Ability' },
    customNotes: { type: String }
  }],
  rituals: [{
    ritual: { type: mongoose.Schema.Types.ObjectId, ref: 'Ritual' },
    customNotes: { type: String },
    dcOverride: { type: Number, default: null }
  }],
  
  // Roleplay e Apontamentos
  lore: {
    appearance: { type: String, default: '' },
    personality: { type: String, default: '' },
    history: { type: String, default: '' },
    objective: { type: String, default: '' },
    notes: { type: String, default: '' }
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Character', characterSchema);