const Tripulante = require('../models/Tripulante')
const subirImagen = require('../utils/subirImagen')
const borrarImagen = require('../utils/borrarImagen')
const normalizarPersonaje = require('../utils/normalizarPersonaje')



exports.crear = async (req, res) => {


            try {


                    const datosTripulante = normalizarPersonaje({...req.body})
                    delete datosTripulante.imagenPublicId


                    if(req.file){


                        const { url, publicId} = await subirImagen(req.file.buffer)
                        datosTripulante.imagen = url
                        datosTripulante.imagenPublicId = publicId
                    }

                    const nuevoTripulante = new Tripulante(datosTripulante)
                    const tripulanteGuardado = await nuevoTripulante.save();
                    res.status(201).json(tripulanteGuardado)
            }

            catch (error) {

                res.status(400).json({ message: error.message})

           }

}

exports.obtenerTodos = async (req, res) => {


            try{


                    const tripulantes = await Tripulante.find().populate('tripulacion');
                    res.json(tripulantes);

           }

           catch (error) {


                res.status(500).json({ message: error.message})
          }
}


exports.obtenerPorId = async (req, res) => {



                    try{


                        const tripulante = await Tripulante.findById(req.params.id).populate('tripulacion')
                        

                        if(!tripulante) {


                            return res.status(404).json({error: 'Tripulante no encontrado'})
                        
                        }

                        res.json(tripulante)
                        
                    }
                        catch (error) {


                                res.status(500).json({ error: error.message})
                       }
             
}

exports.actualizar = async (req, res) => {


            try {


                const tripulantePrevio = await Tripulante.findById(req.params.id);

                if(!tripulantePrevio) {



                    return res.status(404).json({ message: 'Tripulante no encontrado'})



                }
                
                const datosActualizados = normalizarPersonaje({...req.body})
                delete datosActualizados.imagenPublicId

                let publicIdAnterior = null;


                if(req.file) {

                    const { url, publicId} = await subirImagen(req.file.buffer)
                    datosActualizados.imagen = url;
                    datosActualizados.imagenPublicId = publicId;
                    publicIdAnterior = tripulantePrevio.imagenPublicId

                }



                const tripulanteActualizado = await Tripulante.findByIdAndUpdate(


                        req.params.id,
                        datosActualizados,
                        { returnDocument: 'after', runValidators: true}
                                     
                      ).populate('tripulacion')


                      if(publicIdAnterior){

                        await borrarImagen(publicIdAnterior)

            }

            
            res.json(tripulanteActualizado)
        }

        catch (error) {

            res.status(400).json({ message: error.message})

        }
    }

exports.eliminar = async (req, res) => {



    try {


        const tripulanteEliminado = await Tripulante.findByIdAndDelete(req.params.id)


        if(!tripulanteEliminado){


            return res.status(404).json({ message: 'Tripulante no encontrado'})
        }

        if (tripulanteEliminado.imagenPublicId) {



            await borrarImagen(tripulanteEliminado.imagenPublicId)



        }


        res.json({ message: 'Tripulante eliminado correctamente', tripulante: tripulanteEliminado})

    }


     catch (error) {


        res.status(500).json({ message: error.message})


     }



}   




