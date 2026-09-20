const express = require('express');
const router = express.Router();
const personajeController = require('../controllers/personajeController');
const verificarToken = require('../middleware/auth');
const upload = require('../middleware/upload')

router.post('/', verificarToken, upload.single('imagen'), personajeController.crear);
router.get('/', personajeController.obtenerTodos);
router.put('/:id', verificarToken, upload.single('imagen'), personajeController.actualizar);
router.delete('/:id', verificarToken, personajeController.eliminar);
router.get('/:id', personajeController.obtenerPorId);

module.exports = router;