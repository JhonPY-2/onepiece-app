require('dotenv').config();
const mongoose = require('mongoose');
const Personaje = require('../models/Personaje');

async function corregir() {
    await mongoose.connect(process.env.MONGODB_URI);

    const idCorrecto = '6ab49840bf5269d5b9e9afa8';

    const resultado = await Personaje.collection.updateMany(
        { tripulacion: idCorrecto },
        { $set: { tripulacion: new mongoose.Types.ObjectId(idCorrecto) } }
    );

    console.log('Documentos encontrados:', resultado.matchedCount);
    console.log('Documentos actualizados:', resultado.modifiedCount);

    await mongoose.disconnect();
}

corregir();