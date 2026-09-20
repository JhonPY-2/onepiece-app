const cloudinary = require('../config/cloudinary')

async function borrarImagen(publicId) {

    try {
        await cloudinary.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('No se pudo borrar la imagen en Cloudinary:', error.message);
    }

}

module.exports = borrarImagen;