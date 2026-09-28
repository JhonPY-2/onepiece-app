// tests/personajes.formdata.test.js
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 1) Mock de la subida/borrado en Cloudinary: NO queremos tocar servicios reales
jest.mock('../utils/subirImagen');
const subirImagen = require('../utils/subirImagen');
jest.mock('../utils/borrarImagen');
const borrarImagen = require('../utils/borrarImagen');

const app = require('../app');
const Personaje = require('../models/Personaje');
const conectarDB = require('../config/db');

const URL_FALSA = 'https://res.cloudinary.com/demo/image/upload/formdata-test.png';
const RESULTADO_SUBIDA = { url: URL_FALSA, publicId: 'onepiece-app/formdata-test' };
const TRIPULACION_PRUEBA = new mongoose.Types.ObjectId().toString();

describe('Personajes - campos complejos via FormData (Cloudinary mockeado)', () => {
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

  test('POST crea normalizando frutaDiablo, habilidades y arcos que llegan como strings JSON', async () => {
    const res = await request(app)
      .post('/personajes')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', `Test FormData ${Date.now()}`)
      .field('tripulacion', TRIPULACION_PRUEBA)
      .field('frutaDiablo', JSON.stringify({ nombre: 'Gomu Gomu no Mi', tipo: 'Paramecia', despertada: true }))
      .field('habilidades', JSON.stringify(['Gear 5', 'Haki del Rey']))
      .field('arcos', JSON.stringify(['East Blue', 'Wano']));

    expect(res.status).toBe(201);
    idsCreados.push(res.body._id);

    expect(res.body.frutaDiablo).toEqual({
      nombre: 'Gomu Gomu no Mi',
      tipo: 'Paramecia',
      despertada: true
    });
    expect(res.body.habilidades).toEqual(['Gear 5', 'Haki del Rey']);
    expect(res.body.arcos).toEqual(['East Blue', 'Wano']);
  });

  test('POST con frutaDiablo JSON invalido responde 400 y no crea nada', async () => {
    const nombre = `Test Inválido ${Date.now()}`;

    const res = await request(app)
      .post('/personajes')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', nombre)
      .field('tripulacion', TRIPULACION_PRUEBA)
      .field('frutaDiablo', 'esto-no-es-json');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('frutaDiablo');

    const enBD = await Personaje.findOne({ nombre });
    expect(enBD).toBeNull();
  });

  test('PUT actualiza normalizando frutaDiablo, habilidades y arcos que llegan como strings JSON', async () => {
    const personaje = await Personaje.create({
      nombre: `Test Editar FormData ${Date.now()}`,
      tripulacion: TRIPULACION_PRUEBA,
      frutaDiablo: { nombre: 'Anterior', tipo: 'Zoan', despertada: false },
    });
    idsCreados.push(personaje._id.toString());

    const res = await request(app)
      .put(`/personajes/${personaje._id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', personaje.nombre)
      .field('tripulacion', TRIPULACION_PRUEBA)
      .field('frutaDiablo', JSON.stringify({ nombre: 'Gomu Gomu no Mi', tipo: 'Paramecia', despertada: 'false' }))
      .field('habilidades', JSON.stringify(['Gear 5']))
      .field('arcos', JSON.stringify(['Wano']));

    expect(res.status).toBe(200);

    expect(res.body.frutaDiablo).toEqual({
      nombre: 'Gomu Gomu no Mi',
      tipo: 'Paramecia',
      despertada: false
    });
    expect(res.body.habilidades).toEqual(['Gear 5']);
    expect(res.body.arcos).toEqual(['Wano']);
    expect(subirImagen).not.toHaveBeenCalled();
    expect(borrarImagen).not.toHaveBeenCalled();
  });

  test('PUT con arcos JSON invalido responde 400 y no modifica el personaje', async () => {
    const personaje = await Personaje.create({
      nombre: `Test Editar Inválido ${Date.now()}`,
      tripulacion: TRIPULACION_PRUEBA,
      arcos: ['Original'],
    });
    idsCreados.push(personaje._id.toString());

    const res = await request(app)
      .put(`/personajes/${personaje._id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', personaje.nombre)
      .field('tripulacion', TRIPULACION_PRUEBA)
      .field('arcos', 'no-esto-no');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('arcos');

    const enBD = await Personaje.findById(personaje._id);
    expect(enBD.arcos).toEqual(['Original']);
  });

});