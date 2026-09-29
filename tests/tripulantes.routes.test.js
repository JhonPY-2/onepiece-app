require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Mock de Cloudinary: no queremos tocar el servicio real
jest.mock('../utils/subirImagen');
const subirImagen = require('../utils/subirImagen');
jest.mock('../utils/borrarImagen');
const borrarImagen = require('../utils/borrarImagen');

const app = require('../app');
const Tripulante = require('../models/Tripulante');
const Tripulacion = require('../models/Tripulacion');

const URL_FALSA = 'https://res.cloudinary.com/demo/image/upload/tripulante-test.png';
const RESULTADO_SUBIDA = { url: URL_FALSA, publicId: 'onepiece-app/tripulante-test' };

const tokenValido = jwt.sign(
  { id: '123', email: 'test@onepiece.com' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Rutas de Tripulantes - integracion', () => {
  let tripulacionPrueba;
  let idTripulanteCreado;
  const idsCreados = [];

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    tripulacionPrueba = await Tripulacion.create({
      nombre: 'Tripulacion de Prueba Tests',
      capitan: 'Capitan de Prueba',
    });
  });

  beforeEach(() => {
    subirImagen.mockResolvedValue(RESULTADO_SUBIDA);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Tripulante.deleteMany({ _id: { $in: idsCreados } });
    await Tripulacion.findByIdAndDelete(tripulacionPrueba._id);
    await mongoose.connection.close();
  });

  test('GET /tripulantes debe ser publico (sin token)', async () => {
    const respuesta = await request(app).get('/tripulantes');

    expect(respuesta.status).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('POST /tripulantes sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .post('/tripulantes')
      .field('nombre', 'Test Jest')
      .field('tripulacion', tripulacionPrueba._id.toString());

    expect(respuesta.status).toBe(401);
  });

  test('POST /tripulantes con token valido crea y normaliza frutaDiablo/habilidades/arcos', async () => {
    const respuesta = await request(app)
      .post('/tripulantes')
      .set('Authorization', `Bearer ${tokenValido}`)
      .field('nombre', `Test Jest ${Date.now()}`)
      .field('tripulacion', tripulacionPrueba._id.toString())
      .field('recompensa', '500000')
      .field('frutaDiablo', JSON.stringify({ nombre: 'Test no Mi', tipo: 'Paramecia', despertada: true }))
      .field('habilidades', JSON.stringify(['Fuerza', 'Velocidad']))
      .field('arcos', JSON.stringify(['Arco de Prueba']));

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.recompensa).toBe(500000);
    expect(respuesta.body.frutaDiablo).toEqual({
      nombre: 'Test no Mi',
      tipo: 'Paramecia',
      despertada: true
    });
    expect(respuesta.body.habilidades).toEqual(['Fuerza', 'Velocidad']);
    expect(respuesta.body.arcos).toEqual(['Arco de Prueba']);
    expect(subirImagen).not.toHaveBeenCalled();

    idTripulanteCreado = respuesta.body._id;
    idsCreados.push(idTripulanteCreado);
  });

  test('POST /tripulantes con frutaDiablo JSON invalido responde 400', async () => {
    const respuesta = await request(app)
      .post('/tripulantes')
      .set('Authorization', `Bearer ${tokenValido}`)
      .field('nombre', `Test Invalido ${Date.now()}`)
      .field('tripulacion', tripulacionPrueba._id.toString())
      .field('frutaDiablo', 'esto-no-es-json');

    expect(respuesta.status).toBe(400);
  });

  test('GET /tripulantes/:id devuelve el tripulante con la tripulacion poblada', async () => {
    const respuesta = await request(app).get(`/tripulantes/${idTripulanteCreado}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.tripulacion.nombre).toBe('Tripulacion de Prueba Tests');
  });

  test('PUT /tripulantes/:id sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .put(`/tripulantes/${idTripulanteCreado}`)
      .field('nombre', 'Nombre cambiado');

    expect(respuesta.status).toBe(401);
  });

  test('PUT /tripulantes/:id con token valido actualiza', async () => {
    const respuesta = await request(app)
      .put(`/tripulantes/${idTripulanteCreado}`)
      .set('Authorization', `Bearer ${tokenValido}`)
      .field('nombre', 'Nombre cambiado')
      .field('tripulacion', tripulacionPrueba._id.toString())
      .field('recompensa', '600000');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.nombre).toBe('Nombre cambiado');
    expect(respuesta.body.recompensa).toBe(600000);
  });

  test('DELETE /tripulantes/:id sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .delete(`/tripulantes/${idTripulanteCreado}`);

    expect(respuesta.status).toBe(401);
  });

  test('DELETE /tripulantes/:id con token valido elimina', async () => {
    const respuesta = await request(app)
      .delete(`/tripulantes/${idTripulanteCreado}`)
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.message).toBe('Tripulante eliminado correctamente');

    idTripulanteCreado = null;
  });

});