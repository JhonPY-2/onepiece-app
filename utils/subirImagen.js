const cloudinary = require('../config/cloudinary')


function subirImagen(buffer) {

    return new Promise((resolve, reject) => {


        const stream = cloudinary.uploader.upload_stream(
            {folder: 'onepiece-app'},
            (error, resultado) => {

                if(error) return reject(error);
                    resolve({ url: resultado.secure_url, publicId: resultado.public_id });
                }

            
        );

            stream.end(buffer);

    });

}

module.exports = subirImagen;