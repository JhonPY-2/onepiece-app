const express = require('express');
const router = express.Router();
const atletaController = require('../controllers/atletaController');
const verificarToken = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', verificarToken,upload.single('imagen'), atletaController.crear);
router.get('/', atletaController.obtenerTodos);
router.put('/:id', verificarToken,upload.single('imagen'), atletaController.actualizar);
router.delete('/:id', verificarToken, atletaController.eliminar);
router.get('/:id', atletaController.obtenerPorId);

module.exports = router;