// tests/unit/middlewares/authMiddleware.test.js
const authMiddleware = require('../../../middlewares/authMiddleware');

// Mock de verifyAccessToken
jest.mock('../../../config/jsonwebtoken.js', () => ({
  verifyAccessToken: jest.fn()
}));

const { verifyAccessToken } = require('../../../config/jsonwebtoken.js');

describe('authMiddleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      headers: {},
      query: {},
      cookies: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate()', () => {
    it('debe retornar 401 cuando no hay token', () => {
      authMiddleware.authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token de acceso requerido',
        code: 'TOKEN_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe extraer token del header Authorization', () => {
      const token = 'test-token';
      const decoded = { 
        user_id: 1, 
        email: 'test@example.com',
        role: 'admin'
      };
      
      req.headers.authorization = `Bearer ${token}`;
      verifyAccessToken.mockReturnValue(decoded);
      
      authMiddleware.authenticate(req, res, next);
      
      expect(verifyAccessToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual({
        id_user: 1,
        email: 'test@example.com',
        role: 'admin',
        name: '',
        surname: '',
        loginMethod: 'traditional'
      });
      expect(req.token).toBe(token);
      expect(req.tokenExpired).toBe(false);
      expect(next).toHaveBeenCalled();
    });

    it('debe extraer token del query parameter', () => {
      const token = 'query-token';
      const decoded = { 
        id_user: 2, 
        email: 'test2@example.com'
      };
      
      req.query.token = token;
      verifyAccessToken.mockReturnValue(decoded);
      
      authMiddleware.authenticate(req, res, next);
      
      expect(verifyAccessToken).toHaveBeenCalledWith(token);
      expect(req.user.id_user).toBe(2);
      expect(next).toHaveBeenCalled();
    });

    it('debe extraer token de las cookies', () => {
      const token = 'cookie-token';
      const decoded = { 
        user_id: 3, 
        email: 'test3@example.com'
      };
      
      req.cookies.access_token = token;
      verifyAccessToken.mockReturnValue(decoded);
      
      authMiddleware.authenticate(req, res, next);
      
      expect(verifyAccessToken).toHaveBeenCalledWith(token);
      expect(req.user.id_user).toBe(3);
      expect(next).toHaveBeenCalled();
    });

    it('debe extraer token del body', () => {
      const token = 'body-token';
      const decoded = { 
        user_id: 4, 
        email: 'test4@example.com'
      };
      
      req.body.token = token;
      verifyAccessToken.mockReturnValue(decoded);
      
      authMiddleware.authenticate(req, res, next);
      
      expect(verifyAccessToken).toHaveBeenCalledWith(token);
      expect(req.user.id_user).toBe(4);
      expect(next).toHaveBeenCalled();
    });

    it('debe priorizar header sobre otras fuentes', () => {
      const headerToken = 'header-token';
      const decoded = { user_id: 5, email: 'test5@example.com' };
      
      req.headers.authorization = `Bearer ${headerToken}`;
      req.query.token = 'query-token';
      req.cookies.access_token = 'cookie-token';
      req.body.token = 'body-token';
      
      verifyAccessToken.mockReturnValue(decoded);
      
      authMiddleware.authenticate(req, res, next);
      
      expect(verifyAccessToken).toHaveBeenCalledWith(headerToken);
      expect(verifyAccessToken).toHaveBeenCalledTimes(1);
      expect(req.user.id_user).toBe(5);
      expect(next).toHaveBeenCalled();
    });

    it('debe manejar tokens con user_id o id_user', () => {
      const token = 'test-token';
      
      // Test con user_id
      verifyAccessToken.mockReturnValue({
        user_id: 10,
        email: 'test@example.com'
      });
      
      req.headers.authorization = `Bearer ${token}`;
      authMiddleware.authenticate(req, res, next);
      
      expect(req.user.id_user).toBe(10);
      
      // Test con id_user
      verifyAccessToken.mockReturnValue({
        id_user: 20,
        email: 'test2@example.com'
      });
      
      const req2 = { ...req };
      const res2 = { ...res };
      const next2 = jest.fn();
      
      authMiddleware.authenticate(req2, res2, next2);
      
      expect(req2.user.id_user).toBe(20);
    });

    it('debe retornar 401 si el token no contiene user_id ni id_user', () => {
      const token = 'invalid-token';
      
      verifyAccessToken.mockReturnValue({
        email: 'test@example.com'
        // Sin user_id ni id_user
      });
      
      req.headers.authorization = `Bearer ${token}`;
      authMiddleware.authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido: falta identificación de usuario',
        code: 'INVALID_TOKEN_FORMAT'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe manejar tokens expirados estableciendo tokenExpired = true', () => {
      const token = 'expired-token';
      
      verifyAccessToken.mockImplementation(() => {
        throw new Error('ACCESS_TOKEN_EXPIRED');
      });
      
      req.headers.authorization = `Bearer ${token}`;
      authMiddleware.authenticate(req, res, next);
      
      expect(req.tokenExpired).toBe(true);
      expect(req.user).toBeNull();
      expect(req.token).toBe(token);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe retornar 401 para otros errores de token', () => {
      const token = 'invalid-token';
      
      verifyAccessToken.mockImplementation(() => {
        throw new Error('Token malformado');
      });
      
      req.headers.authorization = `Bearer ${token}`;
      authMiddleware.authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Token inválido o mal formado',
          code: 'INVALID_TOKEN'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('debe incluir debug info solo en development', () => {
      const originalEnv = process.env.NODE_ENV;
      const token = 'invalid-token';
      const error = new Error('Token malformado');
      
      // Test en development
      process.env.NODE_ENV = 'development';
      
      verifyAccessToken.mockImplementation(() => {
        throw error;
      });
      
      req.headers.authorization = `Bearer ${token}`;
      authMiddleware.authenticate(req, res, next);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: {
            error: error.message,
            name: error.name
          }
        })
      );
      
      // Resetear mocks
      res.status.mockClear();
      res.json.mockClear();
      
      // Test en production
      process.env.NODE_ENV = 'production';
      
      const req2 = { ...req };
      const res2 = { ...res };
      
      authMiddleware.authenticate(req2, res2, next);
      
      expect(res2.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          debug: expect.anything()
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('requireAdmin()', () => {
    it('debe permitir acceso si el usuario es admin', () => {
      req.user = { role: 'admin' };
      
      authMiddleware.requireAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe retornar 401 si no hay usuario autenticado', () => {
      // req.user no está definido
      
      authMiddleware.requireAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe retornar 403 si el usuario no es admin', () => {
      req.user = { role: 'user' };
      
      authMiddleware.requireAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Acceso denegado: solo administradores',
        code: 'ADMIN_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireHR()', () => {
    it('debe permitir acceso si el usuario es hr', () => {
      req.user = { role: 'hr' };
      
      authMiddleware.requireHR(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe retornar 401 si no hay usuario autenticado', () => {
      // req.user no está definido
      
      authMiddleware.requireHR(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe retornar 403 si el usuario no es hr', () => {
      req.user = { role: 'admin' };
      
      authMiddleware.requireHR(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Acceso denegado: solo recursos humanos',
        code: 'HR_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireMarketing()', () => {
    it('debe permitir acceso si el usuario es mkt', () => {
      req.user = { role: 'mkt' };
      
      authMiddleware.requireMarketing(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe retornar 401 si no hay usuario autenticado', () => {
      // req.user no está definido
      
      authMiddleware.requireMarketing(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe retornar 403 si el usuario no es mkt', () => {
      req.user = { role: 'user' };
      
      authMiddleware.requireMarketing(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Acceso denegado: solo marketing',
        code: 'MARKETING_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated()', () => {
    it('debe permitir acceso si hay usuario autenticado', () => {
      req.user = { role: 'user' };
      
      authMiddleware.isAuthenticated(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe retornar 401 si no hay usuario autenticado', () => {
      // req.user no está definido
      
      authMiddleware.isAuthenticated(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('hasRole() factory function', () => {
    it('debe crear middleware que verifique un rol específico', () => {
      const requireEditor = authMiddleware.hasRole('editor');
      
      // Usuario con rol correcto
      req.user = { role: 'editor' };
      
      requireEditor(req, res, next);
      expect(next).toHaveBeenCalled();
      
      // Usuario con rol incorrecto
      req.user = { role: 'user' };
      const res2 = { ...res };
      const next2 = jest.fn();
      
      requireEditor(req, res2, next2);
      expect(res2.status).toHaveBeenCalledWith(403);
      expect(res2.json).toHaveBeenCalledWith({
        success: false,
        message: 'Acceso denegado. Se requiere rol: editor',
        code: 'ROLE_REQUIRED'
      });
    });

    it('debe retornar 401 si no hay usuario autenticado', () => {
      const requireEditor = authMiddleware.hasRole('editor');
      // req.user no está definido
      
      requireEditor(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    });
  });

  describe('hasAnyRole() factory function', () => {
    it('debe crear middleware que verifique múltiples roles', () => {
      const requireAdminOrHR = authMiddleware.hasAnyRole(['admin', 'hr']);
      
      // Usuario con rol admin (permitido)
      req.user = { role: 'admin' };
      requireAdminOrHR(req, res, next);
      expect(next).toHaveBeenCalled();
      
      // Usuario con rol hr (permitido)
      req.user = { role: 'hr' };
      const res2 = { ...res };
      const next2 = jest.fn();
      
      requireAdminOrHR(req, res2, next2);
      expect(next2).toHaveBeenCalled();
      
      // Usuario con rol user (no permitido)
      req.user = { role: 'user' };
      const res3 = { ...res };
      const next3 = jest.fn();
      
      requireAdminOrHR(req, res3, next3);
      expect(res3.status).toHaveBeenCalledWith(403);
      expect(res3.json).toHaveBeenCalledWith({
        success: false,
        message: 'Acceso denegado. Se requiere uno de estos roles: admin, hr',
        code: 'ROLE_REQUIRED'
      });
    });

    it('debe retornar 401 si no hay usuario autenticado', () => {
      const requireAdminOrHR = authMiddleware.hasAnyRole(['admin', 'hr']);
      // req.user no está definido
      
      requireAdminOrHR(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    });
  });

  describe('Interacción entre middlewares', () => {
    it('debe funcionar correctamente authenticate + requireAdmin', () => {
      const token = 'admin-token';
      const decoded = {
        user_id: 1,
        email: 'admin@example.com',
        role: 'admin'
      };

      verifyAccessToken.mockReturnValue(decoded);

      req.headers.authorization = `Bearer ${token}`;
      
      // Simular authenticate
      authMiddleware.authenticate(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user.role).toBe('admin');

      // Limpiar next para la siguiente llamada
      next.mockClear();

      // Luego requireAdmin
      authMiddleware.requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('debe fallar si authenticate falla y luego se llama requireAdmin', () => {
      // authenticate sin token
      authMiddleware.authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);

      // Limpiar para siguiente test
      res.status.mockClear();
      res.json.mockClear();

      // requireAdmin también debe fallar
      authMiddleware.requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});