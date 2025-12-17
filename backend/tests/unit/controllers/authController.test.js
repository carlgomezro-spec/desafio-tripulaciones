// tests/unit/controllers/authController.test.js
const authController = require('../../../controllers/authController');

// Mock de todas las dependencias SIN tocar tu código
jest.mock('../../../models/authModel', () => ({
  login: jest.fn(),
  getUserById: jest.fn()
}));

jest.mock('../../../config/jsonwebtoken', () => ({
  createAccessToken: jest.fn(),
  createRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn()
}));

// Guardar console.error original y mockearlo
const originalConsoleError = console.error;
console.error = jest.fn();

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    // Configuración base para cada test
    req = {
      body: {},
      cookies: {}
    };
    res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
    
    // Configurar valores por defecto para mocks
    const jwt = require('../../../config/jsonwebtoken');
    jwt.createAccessToken.mockReturnValue('mock.access.token');
    jwt.createRefreshToken.mockReturnValue('mock.refresh.token');
  });

  afterAll(() => {
    // Restaurar console.error original
    console.error = originalConsoleError;
  });

  describe('login()', () => {
    test('debe devolver 400 si faltan email o password', async () => {
      // Test 1: Falta email
      req.body = { password: 'Password123' };
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email y contraseña son requeridos'
      });

      // Test 2: Falta password
      jest.clearAllMocks();
      req.body = { email: 'test@test.com' };
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email y contraseña son requeridos'
      });

      // Test 3: Ambos faltan
      jest.clearAllMocks();
      req.body = {};
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('debe devolver 401 con credenciales inválidas (array vacío)', async () => {
      req.body = { email: 'test@test.com', password: 'Password123' };
      
      const authModel = require('../../../models/authModel');
      authModel.login.mockResolvedValue([]); // Array vacío = credenciales inválidas
      
      await authController.login(req, res);
      
      expect(authModel.login).toHaveBeenCalledWith('test@test.com', 'Password123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Credenciales inválidas'
      });
    });

    test('debe devolver 200 y tokens con credenciales válidas', async () => {
      req.body = { 
        email: 'admin@empresa.com', 
        password: 'Password123' 
      };
      
      const authModel = require('../../../models/authModel');
      authModel.login.mockResolvedValue([{
        user_id: 1,
        email: 'admin@empresa.com',
        role: 'admin',
        name: 'Juan',
        surname: 'Pérez'
      }]);
      
      const jwt = require('../../../config/jsonwebtoken');
      jwt.createAccessToken.mockReturnValue('generated.access.token');
      jwt.createRefreshToken.mockReturnValue('generated.refresh.token');
      
      await authController.login(req, res);
      
      // Verifica que se llama a createAccessToken con los datos correctos
      expect(jwt.createAccessToken).toHaveBeenCalledWith({
        user_id: 1,
        role: 'admin',
        email: 'admin@empresa.com',
        name: 'Juan',
        surname: 'Pérez'
      });
      
      // Verifica respuesta exitosa
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        accessToken: 'generated.access.token',
        expiresIn: 900,
        user: {
          user_id: 1,
          email: 'admin@empresa.com',
          role: 'admin',
          name: 'Juan',
          surname: 'Pérez'
        }
      });
      
      // Verifica cookie establecida
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'generated.refresh.token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/api'
        })
      );
    });

    test('debe manejar campos opcionales name y surname', async () => {
      req.body = { email: 'test@test.com', password: 'Password123' };
      
      const authModel = require('../../../models/authModel');
      authModel.login.mockResolvedValue([{
        user_id: 2,
        email: 'test@test.com',
        role: 'user'
        // Sin name ni surname
      }]);
      
      await authController.login(req, res);
      
      const jwt = require('../../../config/jsonwebtoken');
      expect(jwt.createAccessToken).toHaveBeenCalledWith({
        user_id: 2,
        role: 'user',
        email: 'test@test.com',
        name: '',
        surname: ''
      });
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            name: '',
            surname: ''
          })
        })
      );
    });

    test('debe devolver 500 en caso de error interno', async () => {
      req.body = { email: 'test@test.com', password: 'Password123' };
      
      const authModel = require('../../../models/authModel');
      authModel.login.mockRejectedValue(new Error('Error de conexión a DB'));
      
      // Simular entorno de desarrollo para ver el error
      process.env.NODE_ENV = 'development';
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor',
        error: 'Error de conexión a DB'
      });
      
      // Restaurar
      delete process.env.NODE_ENV;
    });

    test('debe ocultar error en producción', async () => {
      req.body = { email: 'test@test.com', password: 'Password123' };
      
      const authModel = require('../../../models/authModel');
      authModel.login.mockRejectedValue(new Error('Error de conexión a DB'));
      
      // Simular entorno de producción
      process.env.NODE_ENV = 'production';
      
      await authController.login(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor',
        error: undefined // No muestra el error en producción
      });
      
      // Restaurar
      delete process.env.NODE_ENV;
    });
  });

  describe('refreshToken()', () => {
    test('debe devolver 401 si no hay refresh token en cookies', async () => {
      req.cookies = {}; // Sin refresh_token
      
      await authController.refreshToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token requerido',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    });

    test('debe devolver 401 con refresh token expirado', async () => {
      req.cookies = { refresh_token: 'expired.token' };
      
      const jwt = require('../../../config/jsonwebtoken');
      jwt.verifyRefreshToken.mockImplementation(() => {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      });
      
      await authController.refreshToken(req, res);
      
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false, // En desarrollo
        sameSite: 'strict',
        path: '/api'
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Sesión expirada. Por favor inicie sesión nuevamente.',
        code: 'SESSION_EXPIRED'
      });
    });

    test('debe devolver 401 con refresh token inválido', async () => {
      req.cookies = { refresh_token: 'invalid.token' };
      
      const jwt = require('../../../config/jsonwebtoken');
      jwt.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Token expirado'); // Otro mensaje de error
      });
      
      await authController.refreshToken(req, res);
      
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api'
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Sesión expirada. Por favor inicie sesión nuevamente.',
        code: 'SESSION_EXPIRED'
      });
    });

    test('debe devolver 401 con cualquier error de JWT', async () => {
      req.cookies = { refresh_token: 'invalid.token' };
      
      const jwt = require('../../../config/jsonwebtoken');
      jwt.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Cualquier error de JWT');
      });
      
      await authController.refreshToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token inválido',
        code: 'INVALID_REFRESH_TOKEN'
      });
    });

    test('debe devolver 401 si usuario no existe en DB', async () => {
      req.cookies = { refresh_token: 'valid.token' };
      
      const jwt = require('../../../config/jsonwebtoken');
      jwt.verifyRefreshToken.mockReturnValue({
        user_id: 999, // Usuario que no existe
        email: 'noexiste@test.com',
        role: 'user'
      });
      
      const authModel = require('../../../models/authModel');
      authModel.getUserById.mockResolvedValue([]); // Array vacío
      
      await authController.refreshToken(req, res);
      
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api'
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    });

    test('debe generar nuevos tokens con refresh token válido', async () => {
      req.cookies = { refresh_token: 'valid.refresh.token' };
      
      const jwt = require('../../../config/jsonwebtoken');
      jwt.verifyRefreshToken.mockReturnValue({
        user_id: 1,
        email: 'user@test.com',
        role: 'admin'
      });
      
      const authModel = require('../../../models/authModel');
      authModel.getUserById.mockResolvedValue([{
        user_id: 1,
        email: 'user@test.com',
        role: 'admin',
        name: 'Ana',
        surname: 'García'
      }]);
      
      jwt.createAccessToken.mockReturnValue('new.access.token');
      jwt.createRefreshToken.mockReturnValue('new.refresh.token');
      
      await authController.refreshToken(req, res);
      
      // Verifica que se genera nuevo access token
      expect(jwt.createAccessToken).toHaveBeenCalledWith({
        user_id: 1,
        role: 'admin',
        email: 'user@test.com',
        name: 'Ana',
        surname: 'García'
      });
      
      // Verifica que se genera nuevo refresh token
      expect(jwt.createRefreshToken).toHaveBeenCalledWith({
        user_id: 1,
        email: 'user@test.com',
        role: 'admin'
      });
      
      // Verifica respuesta exitosa
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        accessToken: 'new.access.token',
        expiresIn: 900,
        user: {
          user_id: 1,
          email: 'user@test.com',
          role: 'admin',
          name: 'Ana',
          surname: 'García'
        }
      });
      
      // Verifica nueva cookie
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new.refresh.token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
      );
    });

    test('debe devolver 500 en caso de error inesperado en getUserById', async () => {
      req.cookies = { refresh_token: 'valid.token' };
      
      const jwt = require('../../../config/jsonwebtoken');
      jwt.verifyRefreshToken.mockReturnValue({
        user_id: 1,
        email: 'user@test.com',
        role: 'admin'
      });
      
      const authModel = require('../../../models/authModel');
      authModel.getUserById.mockRejectedValue(new Error('Error de conexión a DB'));
      
      await authController.refreshToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('logout()', () => {
    test('debe limpiar cookie de refresh token y devolver 200', () => {
      authController.logout(req, res);
      
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false, // En desarrollo
        sameSite: 'strict',
        path: '/api'
      });
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Sesión cerrada exitosamente.'
      });
    });

    test('debe usar secure: true en producción', () => {
      // Simular entorno de producción
      process.env.NODE_ENV = 'production';
      
      authController.logout(req, res);
      
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', 
        expect.objectContaining({
          secure: true // En producción debe ser true
        })
      );
      
      // Restaurar
      delete process.env.NODE_ENV;
    });
  });
});