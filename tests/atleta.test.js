const Atleta = require('../models/Atleta');

describe('Modelo Atleta - validaciones', () => {

  test('debe fallar si falta el nombre', () => {
    const atleta = new Atleta({
      equipo: 'Inter Miami'
    });

    const error = atleta.validateSync();

    expect(error.errors.nombre).toBeDefined();
  });

  test('debe fallar si falta el equipo', () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi'
    });

    const error = atleta.validateSync();

    expect(error.errors.equipo).toBeDefined();
  });

  test('debe pasar la validacion con los campos requeridos', () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    const error = atleta.validateSync();

    expect(error).toBeUndefined();
  });

  test('logros debe tener valor por defecto null', () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    expect(atleta.logros).toBeNull();
  });

  test('posicion debe tener valor por defecto null', () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    expect(atleta.posicion).toBeNull();
  });

  test('imagen debe tener valor por defecto null', () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    expect(atleta.imagen).toBeNull();
  });

  test('estadisticas debe ser un arreglo vacio por defecto', () => {
    const atleta = new Atleta({
      nombre: 'Lionel Messi',
      equipo: 'Inter Miami'
    });

    expect(atleta.estadisticas).toEqual([]);
  });

});