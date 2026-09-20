const cloudinary = require('../config/cloudinary')


function subirImagen(buffer) {

    return new Promise((resolve, reject) => {


        const stream = cloudinary.uploader.upload_stream(
            {folder: 'onepiece-app'},
            (error, resultado) => {

                if(error) return reject(error);
                    resolve(resultado.secure_url);
                }

            
        );

            stream.end(buffer);

    });

}

module.exports = subirImagen;