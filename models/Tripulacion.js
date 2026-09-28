const mongoose = require('mongoose');




const tripulacionSchema = new mongoose.Schema({

    nombre: {

        type: String,
        required: true,
    },


    capitan: {

        type: String,
        required: true,
    },

    descripcion: {

        type: String,
        default: null,
    },

    numeroMiembros: {


        type: Number,
        default: 0,
    },

    imagen: {

        type: String,
        default: null,
    },

    imagenPublicId: {

        type: String,
        default: null,
    },

    fotoCapitan: {
        type: String,
        default: null,
    },

    fotoCapitanPublicId: {

        type: String,
        default: null,
    },


},
    {

        timestamps: true,

    });
    

const Tripulacion = mongoose.model('Tripulacion', tripulacionSchema)    

module.exports = Tripulacion;