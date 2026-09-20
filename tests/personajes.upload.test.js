// tests/personajes.upload.test.js
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 1) Mock de la subida a Cloudinary: NO queremos subir fotos reales en los tests
jest.mock('../utils/subirImagen');
const subirImagen = require('../utils/subirImagen');

const app = require('../app');
const Personaje = require('../models/Personaje');
const conectarDB = require('../config/db');

const URL_FALSA = 'https://res.cloudinary.com/demo/image/upload/luffy-test.png';

describe('Personajes - subida de imagen (Cloudinary mockeado)', () => {
  let token;
  const idsCreados = [];

  beforeAll(async () => {
    await conectarDB();
    token = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    subirImagen.mockResolvedValue(URL_FALSA);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Personaje.deleteMany({ _id: { $in: idsCreados } });
    await mongoose.connection.close();
  });

  test('POST con imagen: sube a Cloudinary y guarda la URL', async () => {
    const res = await request(app)
      .post('/personajes')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', `Test Upload ${Date.now()}`)
      .field('tripulacion', 'Test Crew')
      .attach('imagen', Buffer.from('contenido-falso'), 'foto.png');

    expect(res.status).toBe(201);
    idsCreados.push(res.body._id);

    expect(subirImagen).toHaveBeenCalledTimes(1);
    expect(res.body.imagen).toBe(URL_FALSA);
  });

  test('POST sin imagen: crea el personaje y NO llama a Cloudinary', async () => {
    const res = await request(app)
      .post('/personajes')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', `Test Sin Foto ${Date.now()}`)
      .field('tripulacion', 'Test Crew');

    expect(res.status).toBe(201);
    idsCreados.push(res.body._id);

    expect(subirImagen).not.toHaveBeenCalled();
    expect(res.body.imagen).toBeFalsy();
  });

  test('POST con imagen pero sin token: 401 y no sube nada', async () => {
    const res = await request(app)
      .post('/personajes')
      .field('nombre', 'No Deberia Crearse')
      .field('tripulacion', 'Test Crew')
      .attach('imagen', Buffer.from('contenido-falso'), 'foto.png');

    expect(res.status).toBe(401);
    expect(subirImagen).not.toHaveBeenCalled();
  });

  test('PUT con imagen nueva: actualiza el campo imagen', async () => {
    // Primero creamos un personaje sin foto directamente en la BD
    const personaje = await Personaje.create({
      nombre: `Test Editar ${Date.now()}`,
      tripulacion: 'Test Crew',
    });
    idsCreados.push(personaje._id.toString());

    const res = await request(app)
      .put(`/personajes/${personaje._id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', personaje.nombre)
      .field('tripulacion', 'Test Crew')
      .attach('imagen', Buffer.from('contenido-falso'), 'nueva.png');

    expect(res.status).toBe(200);
    expect(subirImagen).toHaveBeenCalledTimes(1);
    expect(res.body.imagen).toBe(URL_FALSA);
  });

  test('POST con imagen mayor a 5MB: se rechaza y no se sube ni se crea nada', async () => {
    const nombre = `Test Grande ${Date.now()}`;
    const grande = Buffer.alloc(6 * 1024 * 1024, 'a'); // 6MB

    const res = await request(app)
      .post('/personajes')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', nombre)
      .field('tripulacion', 'Test Crew')
      .attach('imagen', grande, 'grande.png');

    expect(res.status).toBe(413);
    expect(subirImagen).not.toHaveBeenCalled();

    const enBD = await Personaje.findOne({ nombre });
    expect(enBD).toBeNull();
  });
});

