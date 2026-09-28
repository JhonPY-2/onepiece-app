require('dotenv').config();
const mongoose = require('mongoose');
const Personaje = require('../models/Personaje');
const Tripulacion = require('../models/Tripulacion');

const ID_SOMBRERO_DE_PAJA = '6ab49840bf5269d5b9e9afa8';

async function migrar() {

    const aplicar = process.argv.includes('--aplicar');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB\n');

    const tripulacion = await Tripulacion.findById(ID_SOMBRERO_DE_PAJA);

    if (!tripulacion) {
        console.log('No se encontró la tripulación con ese ID. Revisa ID_SOMBRERO_DE_PAJA.');
        await mongoose.disconnect();
        return;
    }

    console.log(`Tripulación destino: "${tripulacion.nombre}" (${tripulacion._id})\n`);

    const personajes = await Personaje.find();

    const coinciden = [];
    const noCoinciden = [];

    for (const personaje of personajes) {

        const textoActual = String(personaje.tripulacion || '').trim().toLowerCase();

        if (textoActual === 'sombrero de paja') {
            coinciden.push(personaje);
        } else {
            noCoinciden.push(personaje);
        }
    }

    console.log(`Personajes que SÍ coinciden (${coinciden.length}):`);
    coinciden.forEach(p => {
        console.log(`  - ${p.nombre} | tripulacion actual: "${p.tripulacion}"`);
    });

    console.log(`\nPersonajes que NO coinciden (${noCoinciden.length}), no se tocarán:`);
    noCoinciden.forEach(p => {
        console.log(`  - ${p.nombre} | tripulacion actual: "${p.tripulacion}"`);
    });

    if (!aplicar) {
        console.log('\nModo ENSAYO: no se modificó nada. Corre con --aplicar para ejecutar de verdad.');
        await mongoose.disconnect();
        return;
    }

    console.log('\nAplicando cambios...');
    let actualizados = 0;
    let errores = 0;

    for (const personaje of coinciden) {
        try {
            personaje.tripulacion = tripulacion._id;
            await personaje.save();
            actualizados++;
        } catch (error) {
            console.log(`  Error al actualizar ${personaje.nombre}: ${error.message}`);
            errores++;
        }
    }

    console.log(`\nListo. Actualizados: ${actualizados}. Errores: ${errores}.`);
    await mongoose.disconnect();
}

migrar();