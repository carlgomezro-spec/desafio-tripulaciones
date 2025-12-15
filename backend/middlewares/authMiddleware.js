const { verifyAccessToken } = require('../config/jsonwebtoken.js');

const authMiddleware = {
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