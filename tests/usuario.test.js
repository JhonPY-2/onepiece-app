  const Usuario = require('../models/Usuario');

  describe('Modelo Usuario - validaciones sincronas', () => {

    test('debe fallar si falta el email', async () => {
      const usuario = new Usuario({
        password: '123456'
      });

      const error = await usuario.validate().catch((e) => e);

      expect(error.errors.email).toBeDefined();
    });

    test('debe fallar si falta el password', async () => {
      const usuario = new Usuario({
        email: 'luffy@onepiece.com'
      });

      const error = await usuario.validate().catch((e) => e);

      expect(error.errors.password).toBeDefined();
    });

    test('debe pasar la validacion con email y password', async () => {
      const usuario = new Usuario({
        email: 'luffy@onepiece.com',
        password: '123456'
      });

      const error = await usuario.validate().catch((e) => e);

      expect(error).toBeUndefined();
    });

    test('el email debe guardarse en minusculas', async () => {
      const usuario = new Usuario({
        email: 'LUFFY@ONEPIECE.COM',
        password: '123456'
      });

      expect(usuario.email).toBe('luffy@onepiece.com');
    });

    test('el email debe quitar espacios (trim)', async () => {
      const usuario = new Usuario({
        email: '  luffy@onepiece.com  ',
        password: '123456'
      });

      expect(usuario.email).toBe('luffy@onepiece.com');
    });

  });