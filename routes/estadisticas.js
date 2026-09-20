const express = require('express');
const router = express.Router();
const estadisticaController = require('../controllers/estadisticaController');


router.get('/resumen', estadisticaController.obtenerResumen)


module.exports = router;
