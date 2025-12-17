const { verifyAccessToken } = require('../config/jsonwebtoken.js');

/**
 * Middleware de autenticación y autorización
 * @module middlewares/authMiddleware
 * @description Colección de middlewares para manejar autenticación JWT y control de acceso por roles.
 * Soporta múltiples fuentes de tokens (header, query, cookies, body) y diferentes niveles de permisos.
 */
const authMiddleware = {
    /**
     * Middleware de autenticación principal que verifica tokens JWT
     * @function authenticate
     * @memberof middlewares/authMiddleware
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @param {Function} next - Función next de Express
     * @returns {void|Object} Continúa al siguiente middleware o retorna respuesta de error
     * @description 
     * Busca tokens JWT en 4 ubicaciones posibles (en orden de prioridad):
     * 1. Header Authorization: `Bearer <token>`
     * 2. Query parameter: `?token=<token>`
     * 3. Cookie: `access_token`
     * 4. Body: `{ token: "<token>" }`
     * 
     * Si el token es válido, agrega `req.user` con los datos del usuario decodificados.
     * Si el token ha expirado, establece `req.tokenExpired = true` para manejo especial.
     * 
     * @example
     * // Uso básico:
     * app.get('/ruta-protegida', authMiddleware.authenticate, (req, res) => {
     *   res.json({ message: 'Acceso concedido', user: req.user });
     * });
     * 
     * @example
     * // Respuesta exitosa: req.user contiene:
     * {
     *   id_user: 123,
     *   email: 'usuario@example.com',
     *   role: 'admin',
     *   name: 'Juan',
     *   surname: 'Pérez',
     *   loginMethod: 'traditional'
     * }
     * 
     * @example
     * // Errores posibles:
     * // 401 TOKEN_REQUIRED: No se encontró token
     * // 401 INVALID_TOKEN_FORMAT: Token no contiene user_id
     * // 401 INVALID_TOKEN: Token inválido o mal formado
     * 
     * @property {string} tokenSource - Origen del token ('header', 'query', 'cookie', 'body', 'none')
     * @property {boolean} tokenExpired - Indica si el token ha expirado (solo para ACCESS_TOKEN_EXPIRED)
     */
    authenticate: (req, res, next) => {
        let token;
        let tokenSource = 'none';
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
            tokenSource = 'header';
        } else if (req.query && req.query.token) {
            token = req.query.token;
            tokenSource = 'query';
        } else if (req.cookies && req.cookies.access_token) {
            token = req.cookies.access_token;
            tokenSource = 'cookie';
        } else if (req.body && req.body.token) {
            token = req.body.token;
            tokenSource = 'body';
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de acceso requerido',
                code: 'TOKEN_REQUIRED'
            });
        }
        
        try {
            const decoded = verifyAccessToken(token);
            
            const userId = decoded.user_id || decoded.id_user;
            
            if (!userId) {
                console.error('Error: Token no contiene user_id ni id_user');
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido: falta identificación de usuario',
                    code: 'INVALID_TOKEN_FORMAT'
                });
            }
            
            req.user = {
                id_user: userId,
                email: decoded.email,
                role: decoded.role || 'user',
                name: decoded.name || '',
                surname: decoded.surname || '',
                loginMethod: decoded.loginMethod || 'traditional'
            };
            req.token = token;
            req.tokenExpired = false;
            
            next();
            
        } catch (error) {
            if (error.message === 'ACCESS_TOKEN_EXPIRED') {
                req.tokenExpired = true;
                req.token = token;
                req.user = null;
                return next();
            }
            
            console.error('Error verificando token:', error.message);
            
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido o mal formado',
                code: 'INVALID_TOKEN',
                debug: process.env.NODE_ENV === 'development' ? {
                    error: error.message,
                    name: error.name
                } : undefined
            });
        }
    },
    
    /**
     * Middleware que requiere rol de administrador
     * @function requireAdmin
     * @memberof middlewares/authMiddleware
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @param {Function} next - Función next de Express
     * @returns {void|Object} Continúa al siguiente middleware o retorna respuesta de error
     * @description Verifica que el usuario autenticado tenga rol "admin"
     * 
     * @example
     * // Uso:
     * app.get('/admin/dashboard', 
     *   authMiddleware.authenticate, 
     *   authMiddleware.requireAdmin, 
     *   adminController.getDashboard
     * );
     * 
     * // Error 403 ADMIN_REQUIRED si el rol no es "admin"
     */
    requireAdmin: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        if (req.user.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Acceso denegado: solo administradores",
                code: "ADMIN_REQUIRED"
            });
        }
        
        next();
    },
    
    /**
     * Middleware que requiere rol de Recursos Humanos
     * @function requireHR
     * @memberof middlewares/authMiddleware
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @param {Function} next - Función next de Express
     * @returns {void|Object} Continúa al siguiente middleware o retorna respuesta de error
     * @description Verifica que el usuario autenticado tenga rol "hr"
     * 
     * @example
     * // Uso:
     * app.get('/hr/employees', 
     *   authMiddleware.authenticate, 
     *   authMiddleware.requireHR, 
     *   hrController.getEmployees
     * );
     * 
     * // Error 403 HR_REQUIRED si el rol no es "hr"
     */
    requireHR: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        if (req.user.role !== "hr") {
            return res.status(403).json({ 
                success: false, 
                message: "Acceso denegado: solo recursos humanos",
                code: "HR_REQUIRED"
            });
        }
        
        next();
    },
    
    /**
     * Middleware que requiere rol de Marketing
     * @function requireMarketing
     * @memberof middlewares/authMiddleware
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @param {Function} next - Función next de Express
     * @returns {void|Object} Continúa al siguiente middleware o retorna respuesta de error
     * @description Verifica que el usuario autenticado tenga rol "mkt"
     * 
     * @example
     * // Uso:
     * app.get('/mkt/campaigns', 
     *   authMiddleware.authenticate, 
     *   authMiddleware.requireMarketing, 
     *   mktController.getCampaigns
     * );
     * 
     * // Error 403 MARKETING_REQUIRED si el rol no es "mkt"
     */
    requireMarketing: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        if (req.user.role !== "mkt") {
            return res.status(403).json({ 
                success: false, 
                message: "Acceso denegado: solo marketing",
                code: "MARKETING_REQUIRED"
            });
        }
        
        next();
    },
    
    /**
     * Middleware que verifica que el usuario esté autenticado
     * @function isAuthenticated
     * @memberof middlewares/authMiddleware
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @param {Function} next - Función next de Express
     * @returns {void|Object} Continúa al siguiente middleware o retorna respuesta de error
     * @description Versión simplificada que solo verifica existencia de req.user
     * 
     * @example
     * // Uso:
     * app.get('/profile', 
     *   authMiddleware.authenticate, 
     *   authMiddleware.isAuthenticated, 
     *   userController.getProfile
     * );
     * 
     * // Error 401 NOT_AUTHENTICATED si no hay req.user
     */
    isAuthenticated: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        next();
    },
    
    /**
     * Factory function que crea un middleware para verificar un rol específico
     * @function hasRole
     * @memberof middlewares/authMiddleware
     * @param {string} role - Rol requerido ('admin', 'hr', 'mkt', 'user')
     * @returns {Function} Middleware de Express que verifica el rol especificado
     * @description Crea un middleware personalizado para cualquier rol
     * 
     * @example
     * // Crear middleware para rol 'editor':
     * const requireEditor = authMiddleware.hasRole('editor');
     * 
     * // Uso:
     * app.get('/editor/articles', 
     *   authMiddleware.authenticate, 
     *   requireEditor, 
     *   editorController.getArticles
     * );
     * 
     * @example
     * // Uso directo:
     * app.get('/admin/users', 
     *   authMiddleware.authenticate, 
     *   authMiddleware.hasRole('admin'), 
     *   adminController.getUsers
     * );
     */
    hasRole: (role) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'No autenticado',
                    code: 'NOT_AUTHENTICATED'
                });
            }
            
            if (req.user.role !== role) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Acceso denegado. Se requiere rol: ${role}`,
                    code: 'ROLE_REQUIRED'
                });
            }
            
            next();
        };
    },
    
    /**
     * Factory function que crea un middleware para verificar múltiples roles
     * @function hasAnyRole
     * @memberof middlewares/authMiddleware
     * @param {Array<string>} roles - Array de roles permitidos
     * @returns {Function} Middleware de Express que verifica si el usuario tiene alguno de los roles
     * @description Crea un middleware que permite acceso si el usuario tiene cualquiera de los roles especificados
     * 
     * @example
     * // Crear middleware para roles 'admin' o 'hr':
     * const requireAdminOrHR = authMiddleware.hasAnyRole(['admin', 'hr']);
     * 
     * // Uso:
     * app.get('/reports', 
     *   authMiddleware.authenticate, 
     *   requireAdminOrHR, 
     *   reportsController.getReports
     * );
     * 
     * @example
     * // Uso directo:
     * app.get('/analytics', 
     *   authMiddleware.authenticate, 
     *   authMiddleware.hasAnyRole(['admin', 'mkt']), 
     *   analyticsController.getData
     * );
     */
    hasAnyRole: (roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'No autenticado',
                    code: 'NOT_AUTHENTICATED'
                });
            }
            
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Acceso denegado. Se requiere uno de estos roles: ${roles.join(', ')}`,
                    code: 'ROLE_REQUIRED'
                });
            }
            
            next();
        };
    }
};

module.exports = authMiddleware;