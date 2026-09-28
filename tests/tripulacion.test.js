const Tripulacion = require('../models/Tripulacion');

describe('Modelo Tripulacion - validaciones', () => {

  test('debe fallar si falta el nombre', async () => {
    const tripulacion = new Tripulacion({
      capitan: 'Monkey D. Luffy'
    });

    const error = await tripulacion.validate().catch((e) => e);

    expect(error.errors.nombre).toBeDefined();
  });

  test('debe fallar si falta el capitan', async () => {
    const tripulacion = new Tripulacion({
      nombre: 'Piratas de Sombrero de Paja'
    });

    const error = await tripulacion.validate().catch((e) => e);

    expect(error.errors.capitan).toBeDefined();
  });

  test('debe pasar la validacion con los campos requeridos', async () => {
    const tripulacion = new Tripulacion({
      nombre: 'Piratas de Sombrero de Paja',
      capitan: 'Monkey D. Luffy'
    });

    const error = await tripulacion.validate().catch((e) => e);

    expect(error).toBeUndefined();
  });

  test('numeroMiembros debe tener valor por defecto 0', async () => {
    const tripulacion = new Tripulacion({
      nombre: 'Piratas de Sombrero de Paja',
      capitan: 'Monkey D. Luffy'
    });

    expect(tripulacion.numeroMiembros).toBe(0);
  });

  test('descripcion, imagen, imagenPublicId, fotoCapitan y fotoCapitanPublicId deben ser null por defecto', async () => {
    const tripulacion = new Tripulacion({
      nombre: 'Piratas de Sombrero de Paja',
      capitan: 'Monkey D. Luffy'
    });

    expect(tripulacion.descripcion).toBeNull();
    expect(tripulacion.imagen).toBeNull();
    expect(tripulacion.imagenPublicId).toBeNull();
    expect(tripulacion.fotoCapitan).toBeNull();
    expect(tripulacion.fotoCapitanPublicId).toBeNull();
  });

});