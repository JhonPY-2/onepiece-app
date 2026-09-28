const normalizarPersonaje = require('../utils/normalizarPersonaje');

describe('utils/normalizarPersonaje', () => {

  test('convierte frutaDiablo de string JSON a objeto con campos normalizados', () => {
    const body = {
      frutaDiablo: '{"nombre":"Gomu Gomu no Mi","tipo":"Paramecia","despertada":true}'
    };

    const resultado = normalizarPersonaje(body);

    expect(resultado.frutaDiablo).toEqual({
      nombre: 'Gomu Gomu no Mi',
      tipo: 'Paramecia',
      despertada: true
    });
  });

  test('pasa nombre y tipo vacios a null dentro de frutaDiablo', () => {
    const body = {
      frutaDiablo: '{"nombre":"","tipo":"","despertada":true}'
    };

    const resultado = normalizarPersonaje(body);

    expect(resultado.frutaDiablo).toEqual({
      nombre: null,
      tipo: null,
      despertada: true
    });
  });

  test('convierte despertada "true"/"false" a booleano', () => {
    const body = {
      frutaDiablo: '{"nombre":"Gomu","tipo":"Paramecia","despertada":"false"}'
    };

    const resultado = normalizarPersonaje(body);

    expect(resultado.frutaDiablo.despertada).toBe(false);
  });

  test('usa valores por defecto si faltan nombre, tipo o despertada', () => {
    const body = {
      frutaDiablo: '{}'
    };

    const resultado = normalizarPersonaje(body);

    expect(resultado.frutaDiablo).toEqual({
      nombre: null,
      tipo: null,
      despertada: false
    });
  });

  test('deja frutaDiablo igual si ya llega como objeto (Postman)', () => {
    const fruta = { nombre: 'Gomu', tipo: 'Paramecia', despertada: true };
    const body = { frutaDiablo: fruta };

    const resultado = normalizarPersonaje(body);

    expect(resultado.frutaDiablo).toBe(fruta);
  });

  test('convierte habilidades y arcos de string JSON a arrays de strings', () => {
    const body = {
      habilidades: '["Gear 5","Haki del Rey"]',
      arcos: '["East Blue","Wano"]'
    };

    const resultado = normalizarPersonaje(body);

    expect(resultado.habilidades).toEqual(['Gear 5', 'Haki del Rey']);
    expect(resultado.arcos).toEqual(['East Blue', 'Wano']);
  });

  test('deja habilidades y arcos igual si ya llegan como arrays', () => {
    const habilidades = ['Haki'];
    const arcos = ['Marineford'];
    const body = { habilidades, arcos };

    const resultado = normalizarPersonaje(body);

    expect(resultado.habilidades).toBe(habilidades);
    expect(resultado.arcos).toBe(arcos);
  });

  test('deja los datos normales intactos si no hay campos complejos', () => {
    const body = { nombre: 'Luffy', tripulacion: 'abc', recompensa: 3000 };

    const resultado = normalizarPersonaje(body);

    expect(resultado).toEqual(body);
  });

  test('lanza un error si frutaDiablo no es un JSON valido', () => {
    const body = { frutaDiablo: 'esto-no-es-json' };

    expect(() => normalizarPersonaje(body)).toThrow("El campo 'frutaDiablo' debe ser un JSON válido");
  });

  test('lanza un error si frutaDiablo parsea a algo que no es un objeto', () => {
    const body = { frutaDiablo: '["no","es","objeto"]' };

    expect(() => normalizarPersonaje(body)).toThrow("El campo 'frutaDiablo' debe ser un objeto con nombre, tipo y despertada");
  });

  test('lanza un error si habilidades no es un JSON valido', () => {
    const body = { habilidades: 'sin-llave' };

    expect(() => normalizarPersonaje(body)).toThrow("El campo 'habilidades' debe ser un JSON válido");
  });

  test('lanza un error si arcos parsea a algo que no es un array', () => {
    const body = { arcos: '{"saga":"Wano"}' };

    expect(() => normalizarPersonaje(body)).toThrow("El campo 'arcos' debe ser un array de strings");
  });

  test('no muta el body original', () => {
    const body = {
      frutaDiablo: '{"nombre":"","tipo":"","despertada":"true"}',
      habilidades: '["A","B"]'
    };

    normalizarPersonaje(body);

    expect(body.frutaDiablo).toBe('{"nombre":"","tipo":"","despertada":"true"}');
    expect(body.habilidades).toBe('["A","B"]');
  });

});