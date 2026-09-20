// tests/estadisticas.routes.test.js
const request = require('supertest');

// 1) Simulamos axios: NO queremos llamar al microservicio de Python de verdad
jest.mock('axios');
const axios = require('axios');

const app = require('../app');

const URL_FASTAPI = 'http://127.0.0.1:8000/estadisticas/resumen';

const RESUMEN = {
  total_personajes: 6,
  total_atletas: 6,
  personaje_mayor_recompensa: {
    nombre: 'Monkey D. Luffy',
    recompensa: 3000000000,
  },
};

describe('GET /estadisticas/resumen (Node -> FastAPI, axios simulado)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('FastAPI responde bien: Node reenvía los datos con 200', async () => {
    axios.get.mockResolvedValue({ data: RESUMEN });

    const res = await request(app).get('/estadisticas/resumen');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(RESUMEN);
  });

  test('Node llama a la URL correcta de FastAPI con timeout de 5s', async () => {
    axios.get.mockResolvedValue({ data: RESUMEN });

    await request(app).get('/estadisticas/resumen');

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(URL_FASTAPI, { timeout: 5000 });
  });

  test('base vacía: reenvía personaje_mayor_recompensa null sin romperse', async () => {
    const vacio = {
      total_personajes: 0,
      total_atletas: 0,
      personaje_mayor_recompensa: null,
    };
    axios.get.mockResolvedValue({ data: vacio });

    const res = await request(app).get('/estadisticas/resumen');

    expect(res.status).toBe(200);
    expect(res.body.personaje_mayor_recompensa).toBeNull();
  });

  test('FastAPI caído (conexión rechazada): responde 502', async () => {
    const error = new Error('connect ECONNREFUSED 127.0.0.1:8000');
    error.code = 'ECONNREFUSED';
    axios.get.mockRejectedValue(error);

    const res = await request(app).get('/estadisticas/resumen');

    expect(res.status).toBe(502);
    expect(res.body.message).toBe('No se pudo conectar con el servicio de estadisticas');
  });

  test('FastAPI tarda más de 5s (timeout): responde 502', async () => {
    const error = new Error('timeout of 5000ms exceeded');
    error.code = 'ECONNABORTED';
    axios.get.mockRejectedValue(error);

    const res = await request(app).get('/estadisticas/resumen');

    expect(res.status).toBe(502);
    expect(res.body.message).toBe('No se pudo conectar con el servicio de estadisticas');
  });

  test('FastAPI responde con error 500: Node responde 502', async () => {
    const error = new Error('Request failed with status code 500');
    error.response = { status: 500, data: { detail: 'Internal Server Error' } };
    axios.get.mockRejectedValue(error);

    const res = await request(app).get('/estadisticas/resumen');

    expect(res.status).toBe(502);
  });
});