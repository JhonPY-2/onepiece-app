const dotenv = require('dotenv');
dotenv.config();

const jwt = require('jsonwebtoken');
const verificarToken = require('../middleware/auth');

function crearRespuestaFalsa() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Middleware verificarToken', () => {

  test('debe fallar con 401 si no hay header authorization', () => {
    const req = { headers: {} };
    const res = crearRespuestaFalsa();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No autorizado, falta token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe fallar con 401 si el header no empieza con "Bearer "', () => {
    const req = { headers: { authorization: 'Token abc123' } };
    const res = crearRespuestaFalsa();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No autorizado, falta token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe fallar con 401 si el token es invalido', () => {
    const req = { headers: { authorization: 'Bearer token-falso-e-invalido' } };
    const res = crearRespuestaFalsa();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe fallar con 401 si el token esta expirado', () => {
    const tokenExpirado = jwt.sign(
      { id: '123' },
      process.env.JWT_SECRET,
      { expiresIn: -10 }
    );
    const req = { headers: { authorization: `Bearer ${tokenExpirado}` } };
    const res = crearRespuestaFalsa();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe llamar a next() y guardar req.usuario si el token es valido', () => {
    const tokenValido = jwt.sign(
      { id: '123', email: 'luffy@onepiece.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const req = { headers: { authorization: `Bearer ${tokenValido}` } };
    const res = crearRespuestaFalsa();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.usuario.id).toBe('123');
    expect(req.usuario.email).toBe('luffy@onepiece.com');
    expect(res.status).not.toHaveBeenCalled();
  });

});