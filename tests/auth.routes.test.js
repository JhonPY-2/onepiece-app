const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Usuario = require('../models/Usuario');

const emailPrueba = 'test.auth.jest@onepiece.com';
const passwordPrueba = 'miPasswordSecreta';

let tokenObtenido;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await Usuario.deleteOne({ email: emailPrueba });
  await mongoose.connection.close();
});

describe('POST /auth/registro', () => {

  test('debe registrar un usuario nuevo y devolver token', async () => {
    const respuesta = await request(app)
      .post('/auth/registro')
      .send({ username: 'testjest', email: emailPrueba, password: passwordPrueba });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.token).toBeDefined();
    expect(respuesta.body.usuario.email).toBe(emailPrueba);
  });

  test('debe fallar con 400 si el email ya esta registrado', async () => {
    const respuesta = await request(app)
      .post('/auth/registro')
      .send({ username: 'otronombre', email: emailPrueba, password: passwordPrueba });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe('El email ya está registrado');
  });

});

describe('POST /auth/login', () => {

  test('debe hacer login con credenciales correctas y devolver token', async () => {
    const respuesta = await request(app)
      .post('/auth/login')
      .send({ email: emailPrueba, password: passwordPrueba });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.token).toBeDefined();
    expect(respuesta.body.usuario.username).toBe('testjest');

    tokenObtenido = respuesta.body.token;
  });

  test('debe fallar con 401 si la password es incorrecta', async () => {
    const respuesta = await request(app)
      .post('/auth/login')
      .send({ email: emailPrueba, password: 'passwordIncorrecta' });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.message).toBe('Contraseña incorrecta');
  });

  test('debe fallar con 404 si el usuario no existe', async () => {
    const respuesta = await request(app)
      .post('/auth/login')
      .send({ email: 'noexiste@onepiece.com', password: 'algo' });

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toBe('Usuario no encontrado');
  });

});

describe('PATCH /auth/completar-perfil', () => {

  test('debe fallar con 401 sin token', async () => {
    const respuesta = await request(app)
      .patch('/auth/completar-perfil')
      .send({ username: 'nuevoUsername' });

    expect(respuesta.status).toBe(401);
  });

  test('debe fallar con 400 si no manda username', async () => {
    const respuesta = await request(app)
      .patch('/auth/completar-perfil')
      .set('Authorization', `Bearer ${tokenObtenido}`)
      .send({});

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe('El username es obligatorio');
  });

  test('debe actualizar el username con token valido', async () => {
    const respuesta = await request(app)
      .patch('/auth/completar-perfil')
      .set('Authorization', `Bearer ${tokenObtenido}`)
      .send({ username: 'nombreActualizado' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.usuario.username).toBe('nombreActualizado');
  });

});