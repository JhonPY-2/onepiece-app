const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

async function connectDB() {



    console.log("Intentando conectar a MongoDB..."); // línea temporal de diagnóstico

    try {

        const conexion = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB conectado: ${conexion.connection.host}`);
        
    }

    catch (error) {

        console.error(`Error al conectar a MongoDB: ${error.message}`);
        process.exit(1);
    }
}


module.exports = connectDB;