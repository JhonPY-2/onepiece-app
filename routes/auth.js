const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificarToken = require('../middleware/auth');

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.patch('/completar-perfil', verificarToken, authController.completarPerfil);

module.exports = router;