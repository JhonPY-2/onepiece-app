const { verificarUriScratch, extraerNombreBaseDeDatos } = require('../verificarUriScratch');

describe('verificarUriScratch - validación estricta del nombre de base', () => {
  test('mongodb://127.0.0.1:27017/onepiece debe fallar (nombre incorrecto)', () => {
    expect(() => verificarUriScratch('mongodb://127.0.0.1:27017/onepiece')).toThrow();
  });

  test('URI con onepiece_agente_scratch solo en query debe fallar (no es nombre de base)', () => {
    expect(() => verificarUriScratch('mongodb://127.0.0.1:27017/otra?authSource=onepiece_agente_scratch')).toThrow();
  });

  test('undefined debe fallar', () => {
    expect(() => verificarUriScratch(undefined)).toThrow();
  });

  test('string vacío debe fallar', () => {
    expect(() => verificarUriScratch('')).toThrow();
  });

  test('valor no parseable debe fallar', () => {
    expect(() => verificarUriScratch('no-es-una-uri-valida')).toThrow();
  });

  test('mongodb://127.0.0.1:27017/onepiece_agente_scratch debe pasar', () => {
    expect(verificarUriScratch('mongodb://127.0.0.1:27017/onepiece_agente_scratch')).toBe(true);
  });

  test('con credenciales y query debe pasar si nombre exacto es correcto', () => {
    expect(
      verificarUriScratch('mongodb://user:pass@host:27017/onepiece_agente_scratch?authSource=admin')
    ).toBe(true);
  });

  test('con host/puerto distintos debe pasar si nombre exacto es correcto', () => {
    expect(verificarUriScratch('mongodb://127.0.0.1:27018/onepiece_agente_scratch')).toBe(true);
    expect(verificarUriScratch('mongodb://localhost:27017/onepiece_agente_scratch')).toBe(true);
  });

  test('extraerNombreBaseDeDatos debe extraer correctamente el nombre exacto', () => {
    expect(extraerNombreBaseDeDatos('mongodb://127.0.0.1:27017/onepiece_agente_scratch')).toBe('onepiece_agente_scratch');
    expect(extraerNombreBaseDeDatos('mongodb://user:pass@host:27017/miBase?retryWrites=true')).toBe('miBase');
  });
});
