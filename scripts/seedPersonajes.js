const mogoose = require('mongoose');
const Personaje = require('../models/Personaje');
const dotenv = require('dotenv');

dotenv.config();


const personajesDePrueba = [
  {
    nombre: "Monkey D. Luffy",
    tripulacion: "Sombrero de Paja",
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
    tripulacion: "Sombrero de Paja",
    recompensa: 1111000000,
    habilidades: ["Ashura", "Santoryu", "Haki del Armamento"],
    arcos: ["East Blue", "Baratie", "Marineford", "Wano"]
  },
  {
    nombre: "Nami",
    tripulacion: "Sombrero de Paja",
    recompensa: 366000000,
    habilidades: ["Clima-Tact", "Navegación experta"],
    arcos: ["East Blue", "Arlong Park", "Skypiea", "Wano"]
  },
  {
    nombre: "Nico Robin",
    tripulacion: "Sombrero de Paja",
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
    tripulacion: "Sombrero de Paja",
    recompensa: 1032000000,
    habilidades: ["Diable Jambe", "Cocina experta"],
    arcos: ["Baratie", "Whole Cake Island", "Wano"]
  },
  {
    nombre: "Tony Tony Chopper",
    tripulacion: "Sombrero de Paja",
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
    tripulacion: "Piratas de Heart",
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