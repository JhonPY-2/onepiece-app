const mogoose = require('mongoose');
const Personaje = require('../models/Personaje');
const Tripulacion = require('../models/Tripulacion');
const dotenv = require('dotenv');

dotenv.config();


const personajesDePrueba = [
  {
    nombre: "Monkey D. Luffy",
    tripulacion: null,
    frutaDiablo: {
      nombre: "Gomu Gomu no Mi",
      tipo: "Paramecia",
      despertada: true
    },
    recompensa: 3000000000,
    habilidades: ["Gear 5", "Haki del Rey", "Gomu Gomu no Bazooka"],
    arcos: ["East Blue", "Alabasta", "Marineford", "Wano"]
  },
  {
    nombre: "Roronoa Zoro",
    tripulacion: null,
    recompensa: 1111000000,
    habilidades: ["Ashura", "Santoryu", "Haki del Armamento"],
    arcos: ["East Blue", "Baratie", "Marineford", "Wano"]
  },
  {
    nombre: "Nami",
    tripulacion: null,
    recompensa: 366000000,
    habilidades: ["Clima-Tact", "Navegación experta"],
    arcos: ["East Blue", "Arlong Park", "Skypiea", "Wano"]
  },
  {
    nombre: "Nico Robin",
    tripulacion: null,
    frutaDiablo: {
      nombre: "Hana Hana no Mi",
      tipo: "Paramecia",
      despertada: false
    },
    recompensa: 930000000,
    habilidades: ["Cien Fleur", "Arqueología"],
    arcos: ["Alabasta", "Enies Lobby", "Wano"]
  },
  {
    nombre: "Vinsmoke Sanji",
    tripulacion: null,
    recompensa: 1032000000,
    habilidades: ["Diable Jambe", "Cocina experta"],
    arcos: ["Baratie", "Whole Cake Island", "Wano"]
  },
  {
    nombre: "Tony Tony Chopper",
    tripulacion: null,
    frutaDiablo: {
      nombre: "Hito Hito no Mi",
      tipo: "Zoan",
      despertada: false
    },
    recompensa: 1000,
    habilidades: ["Monster Point", "Medicina"],
    arcos: ["Drum Island", "Wano"]
  },
  {
    nombre: "Trafalgar Law",
    tripulacion: null,
    frutaDiablo: {
      nombre: "Ope Ope no Mi",
      tipo: "Paramecia",
      despertada: true
    },
    recompensa: 3000000000,
    habilidades: ["Room", "Cirugía"],
    arcos: ["Sabaody", "Dressrosa", "Wano"]
  }
];



async function seed() {

        try {

            await mogoose.connect(process.env.MONGODB_URI); 

                console.log('Conectado a MongoDB para hacer seed...');

            await Personaje.deleteMany({});
            console.log('Colección de personajes limpiada');

            // Crear/obtener tripulaciones (upsert por nombre con $setOnInsert para no pisar datos existentes)
            const [sombrero, heart] = await Promise.all([
                Tripulacion.findOneAndUpdate(
                    { nombre: 'Sombrero de Paja' },
                    { $setOnInsert: { nombre: 'Sombrero de Paja', capitan: 'Monkey D. Luffy' } },
                    { upsert: true, new: true }
                ),
                Tripulacion.findOneAndUpdate(
                    { nombre: 'Piratas de Heart' },
                    { $setOnInsert: { nombre: 'Piratas de Heart', capitan: 'Trafalgar Law' } },
                    { upsert: true, new: true }
                )
            ]);

            // Asignar ObjectIds a los personajes
            const idSombrero = sombrero._id;
            const idHeart = heart._id;
            personajesDePrueba[0].tripulacion = idSombrero;  // Luffy
            personajesDePrueba[1].tripulacion = idSombrero;  // Zoro
            personajesDePrueba[2].tripulacion = idSombrero;  // Nami
            personajesDePrueba[3].tripulacion = idSombrero;  // Robin
            personajesDePrueba[4].tripulacion = idSombrero;  // Sanji
            personajesDePrueba[5].tripulacion = idSombrero;  // Chopper
            personajesDePrueba[6].tripulacion = idHeart;     // Law

            const resultado = await Personaje.insertMany(personajesDePrueba);
            console.log(`Se han insertado ${resultado.length} personajes insetados correctamente`);

            await mogoose.disconnect();
            console.log('Desconectado. Seed completo.');
        }

        catch (error) {
            console.error('Error durante el seed:', error.message);
            process.exit(1);
        }
    
    }
    
seed();