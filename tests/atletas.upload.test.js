// tests/atletas.upload.test.js
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 1) Mock de la subida a Cloudinary (OJO: el archivo real se llama subriImagen)
jest.mock('../utils/subirImagen');
const subirImagen = require('../utils/subirImagen');

const app = require('../app');
const Atleta = require('../models/Atleta');
const conectarDB = require('../config/db');

const URL_FALSA = 'https://res.cloudinary.com/demo/image/upload/atleta-test.png';

describe('Atletas - subida de imagen (Cloudinary mockeado)', () => {
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
    await Atleta.deleteMany({ _id: { $in: idsCreados } });
    await mongoose.connection.close();
  });

  test('POST con imagen: sube a Cloudinary y guarda la URL', async () => {
    const res = await request(app)
      .post('/atletas')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', `Test Atleta ${Date.now()}`)
      .field('equipo', 'Test Team')
      .attach('imagen', Buffer.from('contenido-falso'), 'foto.png');

    expect(res.status).toBe(201);
    idsCreados.push(res.body._id);

    expect(subirImagen).toHaveBeenCalledTimes(1);
    expect(res.body.imagen).toBe(URL_FALSA);
  });

  test('POST sin imagen: crea el atleta y NO llama a Cloudinary', async () => {
    const res = await request(app)
      .post('/atletas')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', `Test Sin Foto ${Date.now()}`)
      .field('equipo', 'Test Team');

    expect(res.status).toBe(201);
    idsCreados.push(res.body._id);

    expect(subirImagen).not.toHaveBeenCalled();
    expect(res.body.imagen).toBeFalsy();
  });

  test('POST con imagen pero sin token: 401 y no sube nada', async () => {
    const res = await request(app)
      .post('/atletas')
      .field('nombre', 'No Deberia Crearse')
      .field('equipo', 'Test Team')
      .attach('imagen', Buffer.from('contenido-falso'), 'foto.png');

    expect(res.status).toBe(401);
    expect(subirImagen).not.toHaveBeenCalled();
  });

  test('PUT con imagen nueva: actualiza el campo imagen', async () => {
    // Primero creamos un atleta sin foto directamente en la BD
    const atleta = await Atleta.create({
      nombre: `Test Editar ${Date.now()}`,
      equipo: 'Test Team',
    });
    idsCreados.push(atleta._id.toString());

    const res = await request(app)
      .put(`/atletas/${atleta._id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', atleta.nombre)
      .field('equipo', 'Test Team')
      .attach('imagen', Buffer.from('contenido-falso'), 'nueva.png');

    expect(res.status).toBe(200);
    expect(subirImagen).toHaveBeenCalledTimes(1);
    expect(res.body.imagen).toBe(URL_FALSA);
  });

  test('POST con imagen mayor a 5MB: responde 413 y no sube ni crea nada', async () => {
    const nombre = `Test Grande ${Date.now()}`;
    const grande = Buffer.alloc(6 * 1024 * 1024, 'a'); // 6MB

    const res = await request(app)
      .post('/atletas')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', nombre)
      .field('equipo', 'Test Team')
      .attach('imagen', grande, 'grande.png');

    expect(res.status).toBe(413);
    expect(subirImagen).not.toHaveBeenCalled();

    const enBD = await Atleta.findOne({ nombre });
    expect(enBD).toBeNull();
  });
});