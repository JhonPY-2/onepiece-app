const mogoose = require('mongoose');
const Atleta = require('../models/Atleta');
const dotenv = require('dotenv');

dotenv.config();


const atletasDePrueba = [
  {
    nombre: "Lionel Messi",
    equipo: "Inter Miami",
    logros: "8 Balones de Oro",
    posicion: "Delantero",
    estadisticas: ["Regate", "Visión de juego", "Definición de gol"],
    imagen: "messi.png"
  },
  {
    nombre: "LeBron James",
    equipo: "Baloncesto",
    logros: "4 campeonatos NBA",
    posicion: "Alero",
    estadisticas: ["Fuerza", "Liderazgo", "Visión de juego"],
    imagen: "lebron.png"
  },
  {
    nombre: "Serena Williams",
    equipo: "Tenis",
    logros: "23 títulos de Grand Slam",
    posicion: "Individual",
    estadisticas: ["Saque", "Potencia", "Mentalidad competitiva"],
    imagen: "serena.png"
  },
  {
    nombre: "Usain Bolt",
    equipo: "Atletismo",
    logros: "8 medallas de oro olímpicas",
    posicion: "Velocista",
    estadisticas: ["Velocidad", "Explosividad", "Reacción"],
    imagen: "bolt.png"
  },
  {
    nombre: "Michael Phelps",
    equipo: "Natación",
    logros: "23 medallas de oro olímpicas",
    posicion: "Estilo libre",
    estadisticas: ["Resistencia", "Técnica", "Capacidad pulmonar"],
    imagen: "phelps.png"
  },
  {
    nombre: "Simone Biles",
    equipo: "Gimnasia",
    logros: "7 medallas olímpicas",
    posicion: "All-around",
    estadisticas: ["Fuerza", "Flexibilidad", "Precisión"],
    imagen: "biles.png"
  }
];



async function seed() {

        try {

            await mogoose.connect(process.env.MONGODB_URI); 

                console.log('Conectado a MongoDB para hacer seed...');

            await Atleta.deleteMany({});
            console.log('Colección de atletas limpiada');


            const resultado = await Atleta.insertMany(atletasDePrueba);
            console.log(`Se han insertado ${resultado.length} atletas insertados correctamente`);

            await mogoose.disconnect();
            console.log('Desconectado. Seed completo.');
        }

        catch (error) {
            console.error('Error durante el seed:', error.message);
            process.exit(1);
        }
    
    }
    
seed();