const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const Atleta = require('../models/Atleta');

const tokenValido = jwt.sign(
  { id: '123', email: 'test@onepiece.com' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

let idAtletaCreado;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  if (idAtletaCreado) {
    await Atleta.findByIdAndDelete(idAtletaCreado);
  }
  await mongoose.connection.close();
});

describe('Rutas de Atletas - integracion', () => {

  test('GET /atletas debe ser publico (sin token)', async () => {
    const respuesta = await request(app).get('/atletas');

    expect(respuesta.status).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('POST /atletas sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .post('/atletas')
      .send({ nombre: 'Test Jest', equipo: 'Equipo Prueba' });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.error).toBe('No autorizado, falta token');
  });

  test('POST /atletas con token valido debe crear (201)', async () => {
    const respuesta = await request(app)
      .post('/atletas')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ nombre: 'Test Jest', equipo: 'Equipo Prueba' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombre).toBe('Test Jest');

    idAtletaCreado = respuesta.body._id;
  });

  test('PUT /atletas/:id sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .put(`/atletas/${idAtletaCreado}`)
      .send({ nombre: 'Nombre cambiado' });

    expect(respuesta.status).toBe(401);
  });

  test('PUT /atletas/:id con token valido debe actualizar', async () => {
    const respuesta = await request(app)
      .put(`/atletas/${idAtletaCreado}`)
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ nombre: 'Nombre cambiado' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.nombre).toBe('Nombre cambiado');
  });

  test('DELETE /atletas/:id sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .delete(`/atletas/${idAtletaCreado}`);

    expect(respuesta.status).toBe(401);
  });

  test('DELETE /atletas/:id con token valido debe eliminar', async () => {
    const respuesta = await request(app)
      .delete(`/atletas/${idAtletaCreado}`)
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.message).toBe('Atleta eliminado correctamente');

    idAtletaCreado = null;
  });

});