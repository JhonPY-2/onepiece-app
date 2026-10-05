const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const Personaje = require('../models/Personaje');

// URI de la base de pruebas (hardcoded para evitar problemas con .env)
const MONGODB_URI_TEST = 'mongodb://127.0.0.1:27017/onepiece_agente_scratch';

const tokenValido = jwt.sign(
  { id: '123', email: 'test@onepiece.com' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const TRIPULACION_PRUEBA = new mongoose.Types.ObjectId();

let idPersonajeCreado;

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI_TEST);
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

describe('GET /personajes/ranking - T3', () => {

  test('cada entrada tiene exactamente nombre, recompensa y tripulacion (string), sin _id', async () => {
    const Tripulacion = require('../models/Tripulacion');
    const Personaje = require('../models/Personaje');
    const t = await Tripulacion.create({ nombre: 'Piratas del Sol', capitan: 'Capitan Sol' });
    await Personaje.create([
      { nombre: 'P1', recompensa: 1000, tripulacion: t._id },
      { nombre: 'P2', recompensa: 2000, tripulacion: t._id }
    ]);

    const res = await request(app).get('/personajes/ranking?limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    res.body.forEach(entrada => {
      const keys = Object.keys(entrada).sort();
      expect(keys).toEqual(['nombre', 'recompensa', 'tripulacion']);
      expect(typeof entrada.nombre).toBe('string');
      expect(typeof entrada.recompensa).toBe('number');
      expect(typeof entrada.tripulacion).toBe('string');
    });

    // limpiar
    await Personaje.deleteMany({ tripulacion: t._id });
    await require('../models/Tripulacion').findByIdAndDelete(t._id);
  });

  test('tripulacion es el nombre de la tripulación, no ObjectId', async () => {
    const res = await request(app).get('/personajes/ranking?limit=2');
    expect(res.status).toBe(200);
    res.body.forEach(entrada => {
      if (entrada.tripulacion !== null) {
        expect(typeof entrada.tripulacion).toBe('string');
        expect(entrada.tripulacion).not.toMatch(/^[0-9a-fA-F]{24}$/);
      }
    });
  });

  test('personaje sin tripulación válida tiene tripulacion: null', async () => {
    const Tripulacion = require('../models/Tripulacion');
    const Personaje = require('../models/Personaje');
    const t = await Tripulacion.create({ nombre: 'Tripulacion Temporal', capitan: 'Temp' });
    const p = await Personaje.create({ nombre: 'Sin Tripulacion', recompensa: 999999999, tripulacion: t._id });
    await Tripulacion.findByIdAndDelete(t._id);

    const res = await request(app).get('/personajes/ranking?limit=10');
    expect(res.status).toBe(200);
    const entrada = res.body.find(e => e.nombre === 'Sin Tripulacion');
    expect(entrada).toBeDefined();
    expect(entrada.tripulacion).toBeNull();

    await Personaje.deleteMany({ _id: p._id });
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

  // T2 - Validación de limit
  test('GET /personajes/ranking con limit=0 devuelve 400', async () => {
    const res = await request(app).get('/personajes/ranking?limit=0');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /personajes/ranking con limit=51 devuelve 400', async () => {
    const res = await request(app).get('/personajes/ranking?limit=51');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /personajes/ranking con limit=abc devuelve 400', async () => {
    const res = await request(app).get('/personajes/ranking?limit=abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /personajes/ranking con limit=10.5 devuelve 400', async () => {
    const res = await request(app).get('/personajes/ranking?limit=10.5');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /personajes/ranking con limit vacío devuelve 400', async () => {
    const res = await request(app).get('/personajes/ranking?limit=');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /personajes/ranking con limit repetido devuelve 400', async () => {
    const res = await request(app).get('/personajes/ranking?limit=10&limit=20');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /personajes/ranking con limit=5 devuelve 200 y 5 items', async () => {
    const res = await request(app).get('/personajes/ranking?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(5);
  });

  test('GET /personajes/ranking con limit=50 devuelve 200 y hasta 50 items', async () => {
    const res = await request(app).get('/personajes/ranking?limit=50');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(50);
  });

});

describe('GET /personajes/ranking - T4', () => {

  let tripulacionId;

  beforeAll(async () => {
    const Tripulacion = require('../models/Tripulacion');
    const t = await Tripulacion.create({ nombre: 'Tripulacion T4', capitan: 'Capitan T4' });
    tripulacionId = t._id;
  });

  afterAll(async () => {
    const Tripulacion = require('../models/Tripulacion');
    const Personaje = require('../models/Personaje');
    await Personaje.deleteMany({ tripulacion: tripulacionId });
    await Tripulacion.findByIdAndDelete(tripulacionId);
  });

  test('desempate por recompensa: orden ascendente por nombre case-insensitive (strength:2)', async () => {
    const Tripulacion = require('../models/Tripulacion');
    const Personaje = require('../models/Personaje');
    const t = await Tripulacion.create({ nombre: 'Tripulacion T4 Desempate', capitan: 'Capitan' });
    await Personaje.create([
      { nombre: 'arlong', recompensa: 999999999, tripulacion: t._id },
      { nombre: 'Bartolomeo', recompensa: 999999999, tripulacion: t._id },
      { nombre: 'Álvaro', recompensa: 999999999, tripulacion: t._id },
      { nombre: 'zorro', recompensa: 999999999, tripulacion: t._id }
    ]);

    const res = await request(app).get('/personajes/ranking?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(4);

    const desempatados = res.body
      .filter(e => e.recompensa === 999999999)
      .map(e => e.nombre);

    expect(desempatados).toEqual(['Álvaro', 'arlong', 'Bartolomeo', 'zorro']);

    await Personaje.deleteMany({ tripulacion: t._id });
    await require('../models/Tripulacion').findByIdAndDelete(t._id);
  });

});

describe('GET /personajes/ranking - T5', () => {

  // Constante FIJA: la única base permitida para esta prueba masiva
  const BASE_DE_PRUEBAS = 'onepiece_agente_scratch';

  test('colección vacía → 200 con []: verifica base y restaura', async () => {
    // Verificar que estamos en la base de pruebas ANTES de cualquier deleteMany masivo
    if (mongoose.connection.name !== BASE_DE_PRUEBAS) {
      throw new Error(`Prueba abortada: se esperaba la base ${BASE_DE_PRUEBAS} y la conexión es ${mongoose.connection.name}`);
    }

    // Backup: guardar todos los documentos existentes
    const backup = await Personaje.collection.find().toArray();

    try {
      // Vaciar la colección
      await Personaje.collection.deleteMany({});

      const res = await request(app).get('/personajes/ranking?limit=10');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual([]);
    } finally {
      // Restaurar documentos originales
      if (backup.length > 0) {
        await Personaje.collection.insertMany(backup);
      }
    }
  });

  test('personaje con recompensa 0 aparece en el ranking', async () => {
    const Tripulacion = require('../models/Tripulacion');
    const Personaje = require('../models/Personaje');
    const t = await Tripulacion.create({ nombre: 'Tripulacion Recompensa Cero', capitan: 'Capitan' });
    // Crear con recompensa 0
    const p = await Personaje.create({ nombre: 'Recompensa Cero', recompensa: 0, tripulacion: t._id });

    try {
      // Verificar que el personaje existe en la BD con recompensa 0
      const enBD = await Personaje.findById(p._id);
      expect(enBD).toBeDefined();
      expect(enBD.recompensa).toBe(0);

      // Verificar que el endpoint devuelve al personaje: buscamos por nombre en el ranking
      // La prueba asume que onepiece_agente_scratch tiene menos de 50 personajes
      const res = await request(app).get('/personajes/ranking?limit=50');
      expect(res.status).toBe(200);
      const entrada = res.body.find(e => e.nombre === 'Recompensa Cero');
      expect(entrada).toBeDefined();
      expect(entrada.recompensa).toBe(0);
    } finally {
      await Personaje.deleteMany({ _id: p._id });
      await Tripulacion.findByIdAndDelete(t._id);
    }
  });

  test('personaje sin tripulación válida aparece con tripulacion: null (insertOne sin validar)', async () => {
    const Tripulacion = require('../models/Tripulacion');
    const t = await Tripulacion.create({ nombre: 'Tripulacion Para Borrar', capitan: 'Temp' });
    // Insertar sin validar: tripulacion referencia un ObjectId que luego borraremos
    const p = await Personaje.collection.insertOne({
      nombre: 'Sin Tripulacion T5',
      recompensa: 999999999,
      tripulacion: t._id
    });
    await Tripulacion.findByIdAndDelete(t._id);

    try {
      const res = await request(app).get('/personajes/ranking?limit=20');
      expect(res.status).toBe(200);
      const entrada = res.body.find(e => e.nombre === 'Sin Tripulacion T5');
      expect(entrada).toBeDefined();
      expect(entrada.tripulacion).toBeNull();
    } finally {
      await Personaje.deleteMany({ _id: p.insertedId });
    }
  });

  test('parámetros desconocidos (?foo=bar) se ignoran y responden 200', async () => {
    const resSinParams = await request(app).get('/personajes/ranking');
    expect(resSinParams.status).toBe(200);
    expect(Array.isArray(resSinParams.body)).toBe(true);

    const resConParams = await request(app).get('/personajes/ranking?foo=bar&otro=123');
    expect(resConParams.status).toBe(200);
    expect(resConParams.body).toEqual(resSinParams.body);
  });

});