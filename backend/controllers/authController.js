const Auth = require('../models/authModel');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../config/jsonwebtoken'); 

/**
 * Módulo de controlador de autenticación
 * @module controllers/authController
 * @description Controlador que gestiona la autenticación de usuarios, 
 * incluyendo login, refresh token y logout.
 */
module.exports = {
    /**
     * Autentica a un usuario y genera tokens JWT
     * @async
     * @function login
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.body - Cuerpo de la petición
     * @param {string} req.body.email - Email del usuario
     * @param {string} req.body.password - Contraseña del usuario
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<Object>} Respuesta JSON con tokens y datos del usuario
     * @throws {Error} 400 - Email o contraseña faltantes
     * @throws {Error} 401 - Credenciales inválidas
     * @throws {Error} 500 - Error interno del servidor
     * @example
     * // POST /api/auth/login
     * // Body: { "email": "usuario@example.com", "password": "contraseña123" }
     * // Respuesta exitosa (200):
     * {
     *   "success": true,
     *   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
     *   "expiresIn": 900,
     *   "user": {
     *     "user_id": 1,
     *     "email": "usuario@example.com",
     *     "role": "user",
     *     "name": "Juan",
     *     "surname": "Pérez"
     *   }
     * }
     * // Cookie establecida: refresh_token
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }
            const userResult = await Auth.login(email, password);
            if (userResult.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            const user = userResult[0];

            const accessToken = createAccessToken({
                user_id: user.user_id,
                role: user.role,
                email: user.email,
                name: user.name || '',
                surname: user.surname || ''
            });

            const refreshToken = createRefreshToken({
                user_id: user.user_id,
                email: user.email,
                role: user.role
            });

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api'
            });
            
            return res.status(200).json({
                success: true,
                accessToken,
                expiresIn: 900,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    name: user.name || '',
                    surname: user.surname || ''
                }
            });
        } catch (err) {
            console.error('Error en login:', err);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    },

    /**
     * Renueva el access token usando el refresh token
     * @async
     * @function refreshToken
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.cookies - Cookies de la petición
     * @param {string} req.cookies.refresh_token - Refresh token JWT
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<Object>} Respuesta JSON con nuevos tokens
     * @throws {Error} 401 - REFRESH_TOKEN_REQUIRED: No se proporcionó refresh token
     * @throws {Error} 401 - SESSION_EXPIRED: Refresh token expirado
     * @throws {Error} 401 - INVALID_REFRESH_TOKEN: Refresh token inválido
     * @throws {Error} 401 - USER_NOT_FOUND: Usuario no encontrado
     * @throws {Error} 500 - Error interno del servidor
     * @example
     * // GET /api/auth/refresh
     * // Cookie: refresh_token=eyJhbGciOiJIUzI1NiIs...
     * // Respuesta exitosa (200):
     * {
     *   "success": true,
     *   "accessToken": "nuevo_token...",
     *   "expiresIn": 900,
     *   "user": {
     *     "user_id": 1,
     *     "email": "usuario@example.com",
     *     "role": "user",
     *     "name": "Juan",
     *     "surname": "Pérez"
     *   }
     * }
     */
    refreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refresh_token;
            
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token requerido',
                    code: 'REFRESH_TOKEN_REQUIRED'
                });
            }
            
            let decoded;
            
            try {
                decoded = verifyRefreshToken(refreshToken);
            } catch (error) {
                if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.message === 'Token expirado') {
                    res.clearCookie('refresh_token', {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        path: '/api'
                    });
                    
                    return res.status(401).json({
                        success: false,
                        message: 'Sesión expirada. Por favor inicie sesión nuevamente.',
                        code: 'SESSION_EXPIRED'
                    });
                }
                
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token inválido',
                    code: 'INVALID_REFRESH_TOKEN'
                });
            }
            
            const userResult = await Auth.getUserById(decoded.user_id);
            
            if (userResult.length === 0) {
                res.clearCookie('refresh_token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/api'
                });
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }
            
            const user = userResult[0];
            
            const newAccessToken = createAccessToken({
                user_id: user.user_id,
                role: user.role,
                email: user.email,
                name: user.name || '',
                surname: user.surname || ''
            });
            
            const newRefreshToken = createRefreshToken({
                user_id: user.user_id,
                email: user.email,
                role: user.role
            });
            
            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api'
            });
            
            return res.json({
                success: true,
                accessToken: newAccessToken,
                expiresIn: 900,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    name: user.name || '',
                    surname: user.surname || ''
                }
            });
            
        } catch (error) {
            console.error('Error en refresh token:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    /**
     * Cierra la sesión del usuario eliminando el refresh token
     * @function logout
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Object} Respuesta JSON confirmando el logout
     * @example
     * // POST /api/auth/logout
     * // Respuesta exitosa (200):
     * {
     *   "success": true,
     *   "message": "Sesión cerrada exitosamente."
     * }
     * // Cookie eliminada: refresh_token
     */
    logout: (req, res) => {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api'
        });
        
        return res.json({
            success: true,
            message: 'Sesión cerrada exitosamente.'
        });
    }
};