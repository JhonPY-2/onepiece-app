const mongoose = require('mongoose')

const tripulanteSchema = new mongoose.Schema({


        nombre: {
            type: String,
            required: true,
        },

        tripulacion: {


            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tripulacion',
            required: true,
        },

        frutaDiablo: {


                nombre: {type: String, default: null},
                tipo: {type: String, default: null},
                despertada: {type: Boolean, default: false}
        },

        recompensa: {


                type: Number,
                default: 0,
        },

        imagen: {

            type: String,
            default: null,
        },


        imagenPublicId: {


            type: String,
            dedfault: null,
          
        },


        habilidades: [String],
        arcos: [String],
},

{
    timestamps: true,
}
)

const Tripulante = mongoose.model('Tripulante', tripulanteSchema);

module.exports = Tripulante