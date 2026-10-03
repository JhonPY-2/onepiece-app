const express = require('express');
const router = express.Router();
const tripulacionController = require('../controllers/tripulacionController')
const upload = require('../middleware/upload');
const verificarToken = require('../middleware/auth');


router.post( '/',
     verificarToken,
     upload.fields([{name: 'imagen', maxCount: 1}, {name: 'fotoCapitan', maxCount: 1}]),
     tripulacionController.crear
)


router.get('/', tripulacionController.obtenerTodas)


router.delete('/:id',verificarToken, tripulacionController.eliminar)

router.put('/:id', verificarToken, upload.fields([{name: 'imagen', maxCount: 1}, {name: 'fotoCapitan', maxCount: 1}]),

     tripulacionController.actualizar

)

router.get('/:id/personajes', tripulacionController.obtenerPersonajes)


router.get('/:id/recompensa-total', tripulacionController.obtenerRecompensaTotal)


module.exports = router;