const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');


exports.registro = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existe = await Usuario.findOne({ email: email?.toLowerCase().trim() });
        if (existe) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const usuario = new Usuario({ username, email, password });
        const usuarioGuardado = await usuario.save();

        const token = jwt.sign(
            { id: usuarioGuardado._id, username: usuarioGuardado.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            usuario: { id: usuarioGuardado._id, username: usuarioGuardado.username, email: usuarioGuardado.email }
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email: email?.toLowerCase().trim() });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const coincide = await usuario.compararPassword(password);
        if (!coincide) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario._id, username: usuario.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            usuario: { id: usuario._id, username: usuario.username, email: usuario.email }
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.completarPerfil = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || !String(username).trim()) {
            return res.status(400).json({ message: 'El username es obligatorio' });
        }

        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        usuario.username = String(username).trim();
        await usuario.save();

        res.status(200).json({
            usuario: { id: usuario._id, username: usuario.username, email: usuario.email }
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};