const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Usuario = require('../models/Usuario');

dotenv.config();

const emailPrueba = 'test.jest@onepiece.com';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await Usuario.deleteOne({ email: emailPrueba });
  await mongoose.connection.close();
});

describe('Modelo Usuario - integracion con MongoDB', () => {

  test('debe hashear el password al guardar', async () => {
    const usuario = new Usuario({
      email: emailPrueba,
      password: 'miPasswordSecreta'
    });

    await usuario.save();

    expect(usuario.password).not.toBe('miPasswordSecreta');
    expect(usuario.password.length).toBeGreaterThan(20);
  });

  test('compararPassword debe devolver true con el password correcto', async () => {
    const usuario = await Usuario.findOne({ email: emailPrueba });

    const esCorrecta = await usuario.compararPassword('miPasswordSecreta');

    expect(esCorrecta).toBe(true);
  });

  test('compararPassword debe devolver false con un password incorrecto', async () => {
    const usuario = await Usuario.findOne({ email: emailPrueba });

    const esCorrecta = await usuario.compararPassword('passwordIncorrecta');

    expect(esCorrecta).toBe(false);
  });

  test('debe fallar al crear un usuario con email duplicado', async () => {
    const usuarioDuplicado = new Usuario({
      email: emailPrueba,
      password: 'otraPassword'
    });

    await expect(usuarioDuplicado.save()).rejects.toThrow();
  });

});