  const Usuario = require('../models/Usuario');

  describe('Modelo Usuario - validaciones sincronas', () => {

    test('debe fallar si falta el email', () => {
      const usuario = new Usuario({
        password: '123456'
      });

      const error = usuario.validateSync();

      expect(error.errors.email).toBeDefined();
    });

    test('debe fallar si falta el password', () => {
      const usuario = new Usuario({
        email: 'luffy@onepiece.com'
      });

      const error = usuario.validateSync();

      expect(error.errors.password).toBeDefined();
    });

    test('debe pasar la validacion con email y password', () => {
      const usuario = new Usuario({
        email: 'luffy@onepiece.com',
        password: '123456'
      });

      const error = usuario.validateSync();

      expect(error).toBeUndefined();
    });

    test('el email debe guardarse en minusculas', () => {
      const usuario = new Usuario({
        email: 'LUFFY@ONEPIECE.COM',
        password: '123456'
      });

      expect(usuario.email).toBe('luffy@onepiece.com');
    });

    test('el email debe quitar espacios (trim)', () => {
      const usuario = new Usuario({
        email: '  luffy@onepiece.com  ',
        password: '123456'
      });

      expect(usuario.email).toBe('luffy@onepiece.com');
    });

  });