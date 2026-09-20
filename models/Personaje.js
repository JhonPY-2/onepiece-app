const mongoose = require('mongoose');


const personajeSchema = new mongoose.Schema({



nombre: {
    type: String,
    required: true
},
tripulacion: {

    type: String,
    required: true
},

frutaDiablo: {
    nombre: {type: String, default: null},
    tipo: {type: String, default: null},
    despertada: {type: Boolean, default: false} 
},

recompensa: {
    type: Number,
    default: 0
},


imagen: {
    type: String,
    default: null
},

imagenPublicId: {
    type: String,
    default: null
},


habilidades: [String],
arcos: [String],
},
{
    timestamps: true
});


const Personaje = mongoose.model('Personaje', personajeSchema);





module.exports = Personaje;


