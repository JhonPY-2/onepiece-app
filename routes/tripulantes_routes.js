const express = require('express')
const router = express.Router();
const tripulanteController = require('../controllers/tripulanteController')
const verificarToken = require('../middleware/auth')
const upload = require('../middleware/upload');



router.post('/', verificarToken, upload.single('imagen'), tripulanteController.crear)
router.get('/', tripulanteController.obtenerTodos)
router.put('/:id', verificarToken, upload.single('imagen'), tripulanteController.actualizar)
router.delete('/:id', verificarToken, tripulanteController.eliminar)
router.get('/:id', tripulanteController.obtenerPorId)


module.exports = router;