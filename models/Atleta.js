const mongoose = require('mongoose');

const atletaSchema = new mongoose.Schema({

  nombre: {
    type: String,
    required: true
  },

  equipo: {
    type: String,
    required: true
  },

  logros: {
    type: String,
    default: null
  },

  posicion: {
    type: String,
    default: null
  },

  estadisticas: [String],

  imagen: {
    type: String,
    default: null
  },

  imagenPublicId: {
    type: String,
    default: null
  },

}, {
  timestamps: true
});

const Atleta = mongoose.model('Atleta', atletaSchema);

module.exports = Atleta;