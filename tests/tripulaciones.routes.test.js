require('dotenv').config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');

jest.mock('../utils/subirImagen');
const subirImagen = require('../utils/subirImagen');

jest.mock('../utils/borrarImagen');
const borrarImagen = require('../utils/borrarImagen');

const app = require('../app');
const Tripulacion = require('../models/Tripulacion');

const tokenValido = jwt.sign(
  { id: new mongoose.Types.ObjectId().toString() },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const URL_FALSA_BANDERA = 'https://res.cloudinary.com/demo/image/upload/bandera-test.png';
const URL_FALSA_CAPITAN = 'https://res.cloudinary.com/demo/image/upload/capitan-test.png';

let idTripulacionCreada;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

beforeEach(() => {
  subirImagen.mockResolvedValueOnce({ url: URL_FALSA_BANDERA, publicId: 'onepiece-app/bandera-test' });
  subirImagen.mockResolvedValueOnce({ url: URL_FALSA_CAPITAN, publicId: 'onepiece-app/capitan-test' });
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  if (idTripulacionCreada) {
    await Tripulacion.findByIdAndDelete(idTripulacionCreada);
  }
  await mongoose.connection.close();
});

describe('Rutas de Tripulaciones - integracion', () => {

  test('GET /tripulaciones debe ser publico (sin token)', async () => {
    const respuesta = await request(app).get('/tripulaciones');

    expect(respuesta.status).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('POST /tripulaciones sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .post('/tripulaciones')
      .field('nombre', 'Test Crew')
      .field('capitan', 'Test Capitan');

    expect(respuesta.status).toBe(401);
    expect(subirImagen).not.toHaveBeenCalled();
  });

  test('POST /tripulaciones con token valido debe crear (201) y subir las dos imagenes', async () => {
    const respuesta = await request(app)
      .post('/tripulaciones')
      .set('Authorization', `Bearer ${tokenValido}`)
      .field('nombre', 'Test Crew')
      .field('capitan', 'Test Capitan')
      .field('descripcion', 'Descripcion de prueba')
      .field('numeroMiembros', '5')
      .attach('imagen', Buffer.from('bandera-falsa'), 'bandera.png')
      .attach('fotoCapitan', Buffer.from('capitan-falso'), 'capitan.png');

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombre).toBe('Test Crew');
    expect(respuesta.body.imagen).toBe(URL_FALSA_BANDERA);
    expect(respuesta.body.fotoCapitan).toBe(URL_FALSA_CAPITAN);
    expect(subirImagen).toHaveBeenCalledTimes(2);

    idTripulacionCreada = respuesta.body._id;
  });

  test('PUT /tripulaciones/:id sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .put(`/tripulaciones/${idTripulacionCreada}`)
      .field('numeroMiembros', '10');

    expect(respuesta.status).toBe(401);
  });

  test('PUT /tripulaciones/:id con token valido debe actualizar sin tocar imagenes existentes', async () => {
    const respuesta = await request(app)
      .put(`/tripulaciones/${idTripulacionCreada}`)
      .set('Authorization', `Bearer ${tokenValido}`)
      .field('numeroMiembros', '10');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.numeroMiembros).toBe(10);
    expect(respuesta.body.imagen).toBe(URL_FALSA_BANDERA);
    expect(subirImagen).not.toHaveBeenCalled();
    expect(borrarImagen).not.toHaveBeenCalled();
  });

  test('PUT /tripulaciones/:id con imagen nueva debe borrar la anterior', async () => {
    const respuesta = await request(app)
      .put(`/tripulaciones/${idTripulacionCreada}`)
      .set('Authorization', `Bearer ${tokenValido}`)
      .attach('imagen', Buffer.from('bandera-nueva'), 'nueva.png');

    expect(respuesta.status).toBe(200);
    expect(borrarImagen).toHaveBeenCalledTimes(1);
    expect(borrarImagen).toHaveBeenCalledWith('onepiece-app/bandera-test');
    expect(subirImagen).toHaveBeenCalledTimes(1);
  });

  test('DELETE /tripulaciones/:id sin token debe fallar con 401', async () => {
    const respuesta = await request(app)
      .delete(`/tripulaciones/${idTripulacionCreada}`);

    expect(respuesta.status).toBe(401);
  });

  test('DELETE /tripulaciones/:id con token valido debe eliminar y borrar ambas imagenes', async () => {
    const respuesta = await request(app)
      .delete(`/tripulaciones/${idTripulacionCreada}`)
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.message).toBe('Tripulacion eliminada correctamente');
    expect(borrarImagen).toHaveBeenCalledTimes(2);

    idTripulacionCreada = null;
  });

});