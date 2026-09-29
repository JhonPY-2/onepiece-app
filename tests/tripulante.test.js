require('dotenv').config();
const mongoose = require('mongoose');
const Tripulante = require('../models/Tripulante');

describe('Modelo Tripulante - validaciones', () => {

  const TRIPULACION_PRUEBA = new mongoose.Types.ObjectId();

  test('falla si falta el nombre', async () => {
    const tripulante = new Tripulante({ tripulacion: TRIPULACION_PRUEBA });

    let error;
    try {
      await tripulante.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.nombre).toBeDefined();
  });

  test('falla si falta la tripulacion', async () => {
    const tripulante = new Tripulante({ nombre: 'Tripulante de Prueba' });

    let error;
    try {
      await tripulante.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.tripulacion).toBeDefined();
  });

  test('pasa la validacion con los campos requeridos', async () => {
    const tripulante = new Tripulante({
      nombre: 'Tripulante de Prueba',
      tripulacion: TRIPULACION_PRUEBA,
    });

    let error;
    try {
      await tripulante.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
  });

  test('valores por defecto: recompensa 0 y frutaDiablo.despertada false', () => {
    const tripulante = new Tripulante({
      nombre: 'Tripulante de Prueba',
      tripulacion: TRIPULACION_PRUEBA,
    });

    expect(tripulante.recompensa).toBe(0);
    expect(tripulante.frutaDiablo.despertada).toBe(false);
    expect(tripulante.frutaDiablo.nombre).toBeNull();
    expect(tripulante.frutaDiablo.tipo).toBeNull();
  });

  test('habilidades y arcos por defecto son arreglos vacios', () => {
    const tripulante = new Tripulante({
      nombre: 'Tripulante de Prueba',
      tripulacion: TRIPULACION_PRUEBA,
    });

    expect(tripulante.habilidades).toEqual([]);
    expect(tripulante.arcos).toEqual([]);
  });

});