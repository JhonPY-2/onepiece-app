const Atleta = require('../models/Atleta');
const subirImagen = require('../utils/subirImagen');

exports.crear = async (req, res) => {
    try {
        

     const datosAtleta = {...req.body}
     
     if(req.file){

        datosAtleta.imagen = await subirImagen(req.file.buffer);

     }
    
    const nuevoAtleta = new Atleta(datosAtleta);
        const atletaGuardado = await nuevoAtleta.save();
        res.status(201).json(atletaGuardado);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.obtenerTodos = async (req, res) => {
    try {
        const atletas = await Atleta.find();
        res.json(atletas);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.actualizar = async (req, res) => {
    try {
        
        const datosActualizados = {...req.body};

        if(req.file){

            datosActualizados.imagen = await subirImagen(req.file.buffer);
            }
    const atletaActualizado = await Atleta.findByIdAndUpdate(
            req.params.id,
             datosActualizados, 
             { returnDocument: 'after', runValidators: true }); 

        if (!atletaActualizado) {
            return res.status(404).json({ message: 'Atleta no encontrado' });
        }

        res.json(atletaActualizado);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.eliminar = async (req, res) => {
    try {
        const atletaEliminado = await Atleta.findByIdAndDelete(req.params.id);

        if (!atletaEliminado) {
            return res.status(404).json({ message: 'Atleta no encontrado' });
        }

        res.json({ message: 'Atleta eliminado correctamente', atleta: atletaEliminado });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.obtenerPorId = async (req, res) => {
  try {
    const atleta = await Atleta.findById(req.params.id);

    if (!atleta) {
      return res.status(404).json({ error: 'Atleta no encontrado' });
    }

    res.json(atleta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};