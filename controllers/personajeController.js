const Personaje = require('../models/Personaje');
const Tripulacion = require('../models/Tripulacion');
const subirImagen = require('../utils/subirImagen');
const borrarImagen = require('../utils/borrarImagen');
const normalizarPersonaje = require('../utils/normalizarPersonaje');


exports.crear = async (req, res) => {
    try {
        const datosPersonaje = normalizarPersonaje(req.body);
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
        const personajes = await Personaje.find().populate('tripulacion');
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

        const datosActualizados = normalizarPersonaje(req.body);
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
             { returnDocument: 'after', runValidators: true }).populate('tripulacion') 

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
    const personaje = await Personaje.findById(req.params.id).populate('tripulacion');

    if (!personaje) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    res.json(personaje);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerRanking = async (req, res) => {
  try {
    const limitRaw = req.query.limit;
    let limit = 10;

    if (limitRaw !== undefined) {
      if (typeof limitRaw !== 'string' || !/^[0-9]+$/.test(limitRaw)) {
        return res.status(400).json({ message: 'El parámetro limit debe ser un entero entre 1 y 50' });
      }
      const limitNum = parseInt(limitRaw, 10);
      if (limitNum < 1 || limitNum > 50) {
        return res.status(400).json({ message: 'El parámetro limit debe ser un entero entre 1 y 50' });
      }
      limit = limitNum;
    }

    const pipeline = [
      { $sort: { recompensa: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: Tripulacion.collection.name,
          localField: 'tripulacion',
          foreignField: '_id',
          as: 'tripulacionData'
        }
      },
      {
        $project: {
          _id: 0,
          nombre: 1,
          recompensa: 1,
          tripulacion: {
            $cond: [
              { $gt: [{ $size: '$tripulacionData' }, 0] },
              { $arrayElemAt: ['$tripulacionData.nombre', 0] },
              null
            ]
          }
        }
      }
    ];

    const resultados = await Personaje.aggregate(pipeline);
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
