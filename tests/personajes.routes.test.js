const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const Personaje = require('../models/Personaje');

const tokenValido = jwt.sign(
  { id: '123', email: 'test@onepiece.com' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const TRIPULACION_PRUEBA = new mongoose.Types.ObjectId();

let idPersonajeCreado;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  if (idPersonajeCreado) {
    await Personaje.findByIdAndDelete(idPersonajeCreado);
  }
  await mongoose.connection.close();
});

describe('Rutas de Personajes - integracion', () => {

  test('GET /personajes debe ser publico (sin token)', async () => {
    const respuesta = await request(app).get('/personajes');

    expect(respuesta.status).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('POST /personajes sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .post('/personajes')
      .send({ nombre: 'Test Jest', tripulacion: TRIPULACION_PRUEBA });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.error).toBe('No autorizado, falta token');
  });

  test('POST /personajes con token valido debe crear (201)', async () => {
    const respuesta = await request(app)
      .post('/personajes')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ nombre: 'Test Jest', tripulacion: TRIPULACION_PRUEBA });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombre).toBe('Test Jest');

    idPersonajeCreado = respuesta.body._id;
  });

  test('PUT /personajes/:id sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .put(`/personajes/${idPersonajeCreado}`)
      .send({ nombre: 'Nombre cambiado' });

    expect(respuesta.status).toBe(401);
  });

  test('PUT /personajes/:id con token valido debe actualizar', async () => {
    const respuesta = await request(app)
      .put(`/personajes/${idPersonajeCreado}`)
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ nombre: 'Nombre cambiado' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.nombre).toBe('Nombre cambiado');
  });

  test('DELETE /personajes/:id sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .delete(`/personajes/${idPersonajeCreado}`);

    expect(respuesta.status).toBe(401);
  });

  test('DELETE /personajes/:id con token valido debe eliminar', async () => {
    const respuesta = await request(app)
      .delete(`/personajes/${idPersonajeCreado}`)
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.message).toBe('Personaje eliminado correctamente');

    idPersonajeCreado = null;
  });

});

describe('GET /personajes/ranking - T1', () => {

  let tripulacionId;

  beforeAll(async () => {
    const Tripulacion = require('../models/Tripulacion');
    const t = await Tripulacion.create({ nombre: 'Sombrero de Paja', capitan: 'Luffy' });
    tripulacionId = t._id;
  });

  afterAll(async () => {
    const Tripulacion = require('../models/Tripulacion');
    await Tripulacion.findByIdAndDelete(tripulacionId);
  });

  test('GET /personajes/ranking sin token devuelve 200 y array', async () => {
    const res = await request(app).get('/personajes/ranking');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /personajes/ranking devuelve hasta 10 personajes ordenados por recompensa descendente', async () => {
    const res = await request(app).get('/personajes/ranking');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(10);
    if (res.body.length > 1) {
      for (let i = 0; i < res.body.length - 1; i++) {
        expect(res.body[i].recompensa).toBeGreaterThanOrEqual(res.body[i + 1].recompensa);
      }
    }
  });

});