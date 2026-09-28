const Tripulacion = require('../models/Tripulacion')
const Personaje = require('../models/Personaje')
const subirImagen = require('../utils/subirImagen')
const borrarImagen = require('../utils/borrarImagen')
const mongoose = require('mongoose')

exports.crear = async (req, res) => {



    try {

        const datosTripulacion = { ...req.body };
        delete datosTripulacion.imagenPublicId;
        delete datosTripulacion.fotoCapitanPublicId;



        if (req.files?.imagen){

            const {url,publicId} = await subirImagen(req.files.imagen[0].buffer);
            datosTripulacion.imagen = url;
            datosTripulacion.imagenPublicId = publicId;
        }

        if(req.files?.fotoCapitan) {

            const { url, publicId} = await subirImagen(req.files.fotoCapitan[0].buffer)
            datosTripulacion.fotoCapitan = url;
            datosTripulacion.fotoCapitanPublicId = publicId;             
        }

        const nuevaTripulacion = new Tripulacion(datosTripulacion);
        const tripulacionGuardada = await nuevaTripulacion.save();
        res.status(201).json(tripulacionGuardada);
    }

    catch (error) {

        res.status(400).json({message: error.message});
    }
}


exports.obtenerTodas = async (req, res) => {


        try{

            const tripulaciones = await Tripulacion.find();
            res.json(tripulaciones);
        }

        catch(error) {

                res.status(500).json({message: error.message})
        }
};



exports.eliminar = async (req, res) => {


            try {

                const tripulacion = await Tripulacion.findById(req.params.id);



                if(!tripulacion) {


                    return res.status(404).json({ message: 'Tripulacion no encontrada'});
                }

                if(tripulacion.imagenPublicId) {
                    await borrarImagen(tripulacion.imagenPublicId);
                }

                if(tripulacion.fotoCapitanPublicId) {
                    await borrarImagen(tripulacion.fotoCapitanPublicId)
                }


                await Tripulacion.findByIdAndDelete(req.params.id);

                res.json({ message: 'Tripulacion eliminada correctamente'})
            }

            catch (error) {

                res.status(500).json({ message: error.message})
            }
}


exports.actualizar = async (req,res) => {


    try{


        const tripulacion = await Tripulacion.findById(req.params.id)



        if(!tripulacion) {


            return res.status(404).json({ message: 'Tripulacion no encontrada'})
      }


      const datosTripulacion = {...req.body};
      delete datosTripulacion.imagenPublicId;
      delete datosTripulacion.fotoCapitanPublicId;

      if(req.files?.imagen) {


            if(tripulacion.imagenPublicId) {
                await borrarImagen(tripulacion.imagenPublicId);
      }

        const {url,publicId} = await subirImagen(req.files.imagen[0].buffer);
        datosTripulacion.imagen = url;
        datosTripulacion.imagenPublicId = publicId;
    }

        if(req.files?.fotoCapitan) {

            if(tripulacion.fotoCapitanPublicId) {


                await borrarImagen(tripulacion.fotoCapitanPublicId);
            }

            const {url, publicId} = await subirImagen(req.files.fotoCapitan[0].buffer);
            datosTripulacion.fotoCapitan = url;
            datosTripulacion.fotoCapitanPublicId = publicId;
        }

        const tripulacionActualizada = await Tripulacion.findByIdAndUpdate(
            req.params.id,
            datosTripulacion,
            {new: true, runValidators: true}
        )

        res.json(tripulacionActualizada);
    }

        catch  (error) {

            res.status(400).json({message: error.message});
        }

}
 
exports.obtenerPersonajes = async (req, res) => {

    try {

        const tripulacion = await Tripulacion.findById(req.params.id);

        if (!tripulacion) {
            return res.status(404).json({ message: 'Tripulacion no encontrada' });
        }

        const personajes = await Personaje.find({ tripulacion: req.params.id });

        res.json(personajes);
    }

    catch (error) {

        res.status(500).json({ message: error.message });
    }
};