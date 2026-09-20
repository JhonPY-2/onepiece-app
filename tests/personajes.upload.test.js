// tests/personajes.upload.test.js
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 1) Mock de la subida a Cloudinary: NO queremos subir fotos reales en los tests
jest.mock('../utils/subirImagen');
const subirImagen = require('../utils/subirImagen');

// 2) Mock del borrado en Cloudinary: tampoco queremos borrar assets reales
jest.mock('../utils/borrarImagen');
const borrarImagen = require('../utils/borrarImagen');

const app = require('../app');
const Personaje = require('../models/Personaje');
const conectarDB = require('../config/db');

const URL_FALSA = 'https://res.cloudinary.com/demo/image/upload/luffy-test.png';
const RESULTADO_SUBIDA = { url: URL_FALSA, publicId: 'onepiece-app/luffy-test' };

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
    subirImagen.mockResolvedValue(RESULTADO_SUBIDA);
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

  test('PUT con foto nueva: sube la nueva y borra la imagen anterior con su publicId', async () => {
    const personaje = await Personaje.create({
      nombre: `Test Reemplazo ${Date.now()}`,
      tripulacion: 'Test Crew',
      imagen: URL_FALSA,
      imagenPublicId: 'onepiece-app/public-anterior',
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
    expect(borrarImagen).toHaveBeenCalledTimes(1);
    expect(borrarImagen).toHaveBeenCalledWith('onepiece-app/public-anterior');
    expect(res.body.imagen).toBe(URL_FALSA);
    expect(res.body.imagenPublicId).toBe('onepiece-app/luffy-test');
  });

  test('DELETE: borra la imagen de Cloudinary con su publicId', async () => {
    const personaje = await Personaje.create({
      nombre: `Test Borrar ${Date.now()}`,
      tripulacion: 'Test Crew',
      imagen: URL_FALSA,
      imagenPublicId: 'onepiece-app/public-eliminar',
    });

    const res = await request(app)
      .delete(`/personajes/${personaje._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(borrarImagen).toHaveBeenCalledTimes(1);
    expect(borrarImagen).toHaveBeenCalledWith('onepiece-app/public-eliminar');
  });

  test('DELETE sin imagenPublicId: NO llama a borrarImagen', async () => {
    const personaje = await Personaje.create({
      nombre: `Test Sin PublicId ${Date.now()}`,
      tripulacion: 'Test Crew',
    });

    const res = await request(app)
      .delete(`/personajes/${personaje._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(borrarImagen).not.toHaveBeenCalled();
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

  test('POST con archivo que no es imagen: responde 415, no sube y no crea nada', async () => {
    const nombre = `Test PDF ${Date.now()}`;

    const res = await request(app)
      .post('/personajes')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', nombre)
      .field('tripulacion', 'Test Crew')
      .attach('imagen', Buffer.from('x'), 'documento.pdf');

    expect(res.status).toBe(415);
    expect(res.body.mensaje).toBe('Solo se aceptan imagenes JPEG, PNG o WebP');
    expect(subirImagen).not.toHaveBeenCalled();

    const enBD = await Personaje.findOne({ nombre });
    expect(enBD).toBeNull();
  });
});

