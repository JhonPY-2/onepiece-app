const Atleta = require('../models/Atleta');

describe('Modelo Atleta - validaciones', () => {

  test('debe fallar si falta el nombre', async () => {
    const atleta = new Atleta({
      equipo: 'Inter Miami'
    });

    const error = await atleta.validate().catch((e) => e);

    expect(error.errors.nombre).toBeDefined();
  });

  test('debe fallar si falta el equipo', async () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi'
    });

    const error = await atleta.validate().catch((e) => e);

    expect(error.errors.equipo).toBeDefined();
  });

  test('debe pasar la validacion con los campos requeridos', async () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    const error = await atleta.validate().catch((e) => e);

    expect(error).toBeUndefined();
  });

  test('logros debe tener valor por defecto null', async () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    expect(atleta.logros).toBeNull();
  });

  test('posicion debe tener valor por defecto null', async () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    expect(atleta.posicion).toBeNull();
  });

  test('imagen debe tener valor por defecto null', async () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    expect(atleta.imagen).toBeNull();
  });

  test('estadisticas debe ser un arreglo vacio por defecto', async () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    expect(atleta.estadisticas).toEqual([]);
  });

});