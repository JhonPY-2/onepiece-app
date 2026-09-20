const Personaje = require('../models/Personaje');

describe('Modelo Personaje - validaciones', () => {

  test('debe fallar si falta el nombre', async () => {
    const personaje = new Personaje({
      tripulacion: 'Piratas de Sombrero de Paja'
    });

    const error = await personaje.validate().catch((e) => e);

    expect(error.errors.nombre).toBeDefined();
  });

  test('debe fallar si falta la tripulacion', async () => {
    const personaje = new Personaje({
      nombre: 'Luffy'
    });

    const error = await personaje.validate().catch((e) => e);

    expect(error.errors.tripulacion).toBeDefined();
  });

  test('debe pasar la validacion con los campos requeridos', async () => {
    const personaje = new Personaje({
      nombre: 'Luffy',
      tripulacion: 'Piratas de Sombrero de Paja'
    });

    const error = await personaje.validate().catch((e) => e);

    expect(error).toBeUndefined();
  });

  test('recompensa debe tener valor por defecto 0', async () => {
    const personaje = new Personaje({
      nombre: 'Luffy',
      tripulacion: 'Piratas de Sombrero de Paja'
    });

    expect(personaje.recompensa).toBe(0);
  });

  test('frutaDiablo.despertada debe tener valor por defecto false', async () => {
    const personaje = new Personaje({
      nombre: 'Luffy',
      tripulacion: 'Piratas de Sombrero de Paja'
    });

    expect(personaje.frutaDiablo.despertada).toBe(false);
  });

});