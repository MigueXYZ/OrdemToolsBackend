const mongoose = require('mongoose');

const weaponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  
  // Proficiência (simples, tática, pesada)
  proficiency: {
    type: String,
    enum: ['Simples', 'Tática', 'Pesada'],
    required: true
  },
  
  // Tipo (corpo a corpo, arremesso, disparo, fogo)
  type: {
    type: String,
    enum: ['Corpo a Corpo', 'Arremesso', 'Disparo', 'Fogo'],
    required: true
  },
  
  // Empunhadura (leve, uma mão, duas mãos)
  grip: {
    type: String,
    enum: ['Leve', 'Uma Mão', 'Duas Mãos'],
    required: true
  },
  
  // Dano (ex: "1d8+2", "2d6", "1d4")
  damage: {
    type: String,
    required: true
  },
  
  // Crítico (margem de ameaça e multiplicador, ex: "19/x3")
  critical: {
    type: String,
    required: true,
    default: '20/x2'
  },
  
  // Categoria (livre, não-enum)
  category: String,
  
  // Alcance (apenas para armas de distância)
  // Categorias: Curto (9m), Médio (18m), Longo (36m), Extremo (90m)
  range: {
    type: String,
    enum: ['Nenhum', 'Curto', 'Médio', 'Longo', 'Extremo'],
    default: 'Nenhum'
  },
  
  // Tipo de dano (Corte, Impacto, Perfuração, Balístico, Fogo)
  damageType: {
    type: String,
    enum: ['Corte', 'Impacto', 'Perfuração', 'Balístico', 'Fogo'],
    required: true
  },
  
  // Espaço no inventário
  space: {
    type: Number,
    required: true,
    default: 1
  },
  
  // Notas adicionais
  notes: String,
  
  book: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

weaponSchema.index({ name: 'text', description: 'text', notes: 'text', category: 'text' });
weaponSchema.index({ tags: 1 });

module.exports = mongoose.model('Weapon', weaponSchema);
