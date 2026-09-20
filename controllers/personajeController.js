const Personaje = require('../models/Personaje');
const subirImagen = require('../utils/subirImagen');
const borrarImagen = require('../utils/borrarImagen');


exports.crear = async (req, res) => {
    try {
        const datosPersonaje = {...req.body};
        delete datosPersonaje.imagenPublicId;
        
        if(req.file){
            const { url, publicId } = await subirImagen(req.file.buffer);
            datosPersonaje.imagen = url;
            datosPersonaje.imagenPublicId = publicId;
        }
    
        const nuevoPersonaje = new Personaje(datosPersonaje);
        const personajeGuardado = await nuevoPersonaje.save();
        res.status(201).json(personajeGuardado);
}
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.obtenerTodos = async (req, res) => {
    try {
        const personajes = await Personaje.find();
        res.json(personajes);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.actualizar = async (req, res) => {
    try {
       
        const personajePrevio = await Personaje.findById(req.params.id);

        if (!personajePrevio) {
            return res.status(404).json({ message: 'Personaje no encontrado' });
        }

        const datosActualizados = {...req.body};
        delete datosActualizados.imagenPublicId;

        let publicIdAnterior = null;

        if (req.file){
            const { url, publicId } = await subirImagen(req.file.buffer);
            datosActualizados.imagen = url;
            datosActualizados.imagenPublicId = publicId;
            publicIdAnterior = personajePrevio.imagenPublicId;
        }


     const personajeActualizado = await Personaje.findByIdAndUpdate(
            req.params.id,
             datosActualizados, 
             { returnDocument: 'after', runValidators: true }); 

        if (publicIdAnterior) {
            await borrarImagen(publicIdAnterior);
        }

        res.json(personajeActualizado);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.eliminar = async (req, res) => {
    try {
        const personajeEliminado = await Personaje.findByIdAndDelete(req.params.id);

        if (!personajeEliminado) {
            return res.status(404).json({ message: 'Personaje no encontrado' });
        }

        if (personajeEliminado.imagenPublicId) {
            await borrarImagen(personajeEliminado.imagenPublicId);
        }

        res.json({ message: 'Personaje eliminado correctamente', personaje: personajeEliminado });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.obtenerPorId = async (req, res) => {
  try {
    const personaje = await Personaje.findById(req.params.id);

    if (!personaje) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    res.json(personaje);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
