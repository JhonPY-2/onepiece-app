const multer = require('multer');

const almacenamiento = multer.memoryStorage();

const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
            storage: almacenamiento,
            limits: {fileSize: 5 * 1024 * 1024},
            fileFilter: (req, file, cb) => {
                if (!tiposPermitidos.includes(file.mimetype)) {
                    const error = new Error('Solo se aceptan imagenes JPEG, PNG o WebP');
                    error.status = 415;
                    return cb(error);
                }
                cb(null, true);
            }
});

module.exports = upload;