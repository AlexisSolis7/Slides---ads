const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  titulo: { type: String, unique: true }, // Título é o "ID" vc usou
  conteudo: String,
  duracao: Number, // em segundos
  expiracao: Date  // a data que o slide deve parar de aparecer
});

module.exports = mongoose.model('Slide', slideSchema);