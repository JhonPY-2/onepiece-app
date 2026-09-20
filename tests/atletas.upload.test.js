// tests/atletas.upload.test.js
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 1) Mock de la subida a Cloudinary (OJO: el archivo real se llama subirImagen)
jest.mock('../utils/subirImagen');
const subirImagen = require('../utils/subirImagen');

// 2) Mock del borrado en Cloudinary: tampoco queremos borrar assets reales
jest.mock('../utils/borrarImagen');
const borrarImagen = require('../utils/borrarImagen');

const app = require('../app');
const Atleta = require('../models/Atleta');
const conectarDB = require('../config/db');

const URL_FALSA = 'https://res.cloudinary.com/demo/image/upload/atleta-test.png';
const RESULTADO_SUBIDA = { url: URL_FALSA, publicId: 'onepiece-app/atleta-test' };

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
    subirImagen.mockResolvedValue(RESULTADO_SUBIDA);
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

  test('PUT con foto nueva: sube la nueva y borra la imagen anterior con su publicId', async () => {
    const atleta = await Atleta.create({
      nombre: `Test Reemplazo ${Date.now()}`,
      equipo: 'Test Team',
      imagen: URL_FALSA,
      imagenPublicId: 'onepiece-app/public-anterior',
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
    expect(borrarImagen).toHaveBeenCalledTimes(1);
    expect(borrarImagen).toHaveBeenCalledWith('onepiece-app/public-anterior');
    expect(res.body.imagen).toBe(URL_FALSA);
    expect(res.body.imagenPublicId).toBe('onepiece-app/atleta-test');
  });

  test('DELETE: borra la imagen de Cloudinary con su publicId', async () => {
    const atleta = await Atleta.create({
      nombre: `Test Borrar ${Date.now()}`,
      equipo: 'Test Team',
      imagen: URL_FALSA,
      imagenPublicId: 'onepiece-app/public-eliminar',
    });

    const res = await request(app)
      .delete(`/atletas/${atleta._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(borrarImagen).toHaveBeenCalledTimes(1);
    expect(borrarImagen).toHaveBeenCalledWith('onepiece-app/public-eliminar');
  });

  test('DELETE sin imagenPublicId: NO llama a borrarImagen', async () => {
    const atleta = await Atleta.create({
      nombre: `Test Sin PublicId ${Date.now()}`,
      equipo: 'Test Team',
    });

    const res = await request(app)
      .delete(`/atletas/${atleta._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(borrarImagen).not.toHaveBeenCalled();
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

  test('POST con archivo que no es imagen: responde 415, no sube y no crea nada', async () => {
    const nombre = `Test PDF ${Date.now()}`;

    const res = await request(app)
      .post('/atletas')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', nombre)
      .field('equipo', 'Test Team')
      .attach('imagen', Buffer.from('x'), 'documento.pdf');

    expect(res.status).toBe(415);
    expect(res.body.mensaje).toBe('Solo se aceptan imagenes JPEG, PNG o WebP');
    expect(subirImagen).not.toHaveBeenCalled();

    const enBD = await Atleta.findOne({ nombre });
    expect(enBD).toBeNull();
  });
});