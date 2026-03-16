const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true // Evita duplicados como 'Nome' e 'nome'
  },
  shownName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // Por padrão, não envia a password nas queries (segurança extra)
  },
  permissions: {
    type: [String],
    default: ['user'], // Garantir que é inicializado como um array
    enum: ['user', 'admin', 'editor'] // Opcional: restringe a estes valores específicos
  }
}, { 
  // Isto cria o createdAt e updatedAt automaticamente
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);