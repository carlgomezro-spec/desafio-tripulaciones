const express = require("express");
const { verifyRefreshToken, createAccessToken } = require('../config/jsonwebtoken');

/**
 * Middleware para renovación automática de access tokens mediante refresh tokens
 * @module middlewares/checkRefreshCookie
 * @description Middleware de Express que intercepta requests con tokens expirados
 * y los renueva automáticamente usando el refresh token almacenado en cookies.
 * Se integra con `authMiddleware.authenticate` para manejo continuo de sesiones.
 */
const checkRefreshCookie = express.Router();

/**
 * Middleware principal que verifica y renueva tokens expirados
 * @function refreshMiddleware
 * @memberof middlewares/checkRefreshCookie
 * @param {Object} req - Objeto de petición de Express
 * @param {boolean} [req.tokenExpired] - Indica si el access token ha expirado (seteado por authMiddleware)
 * @param {Object} [req.cookies] - Cookies de la petición
 * @param {string} [req.cookies.refresh_token] - Refresh token JWT almacenado en cookie
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función next de Express
 * @returns {void|Object} Continúa al siguiente middleware o retorna respuesta de error
 * @description 
 * Este middleware funciona en conjunto con `authMiddleware.authenticate`:
 * 1. Si `req.tokenExpired` es false o undefined, pasa directamente al siguiente middleware
 * 2. Si `req.tokenExpired` es true, intenta renovar el access token usando el refresh token
 * 3. Si la renovación es exitosa, actualiza `req.user` y `req.token`, y agrega header `X-New-Access-Token`
 * 4. Si falla, limpia la cookie de refresh token y retorna error de sesión inválida
 * 
 * @example
 * // Uso típico con authMiddleware:
 * app.get('/api/protected-route',
 *   authMiddleware.authenticate,      // 1. Verifica access token
 *   checkRefreshCookie,               // 2. Renueva si expiró
 *   (req, res) => {                   // 3. Ruta protegida
 *     res.json({ user: req.user });
 *   }
 * );
 * 
 * @example
 * // Flujo exitoso de renovación:
 * // 1. authMiddleware detecta token expirado → req.tokenExpired = true
 * // 2. checkRefreshCookie encuentra refresh_token en cookies
 * // 3. Verifica refresh token → crea nuevo access token
 * // 4. Actualiza req.user y req.token
 * // 5. Agrega header: X-New-Access-Token: <nuevo_token>
 * // 6. Continúa a la ruta protegida
 * 
 * @example
 * // Respuestas de error:
 * // 401 SESSION_EXPIRED: No hay refresh token en cookies
 * // 401 INVALID_SESSION: Refresh token inválido o expirado
 * 
 * @property {string} req.token - Nuevo access token después de renovación exitosa
 * @property {Object} req.user - Datos del usuario actualizados después de renovación
 * @property {boolean} req.tokenExpired - Se establece en false después de renovación exitosa
 * @property {string} res.headers['X-New-Access-Token'] - Header con nuevo token (para cliente)
 * 
 * @see {@link module:middlewares/authMiddleware.authenticate} - Middleware que establece req.tokenExpired
 */
checkRefreshCookie.use(async (req, res, next) => {
    // Si el token no está expirado, continuar normalmente
    if (!req.tokenExpired) {
        return next();
    }
    
    // Obtener refresh token de cookies
    const refreshToken = req.cookies?.refresh_token;
    
    // Si no hay refresh token, sesión expirada
    if (!refreshToken) {
        return res.status(401).json({ 
            success: false, 
            code: 'SESSION_EXPIRED',
            message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' 
        });
    }
    
    try {
        // Verificar refresh token
        const refreshData = verifyRefreshToken(refreshToken);
        
        // Crear nuevo access token
        const newAccessToken = createAccessToken({
            id_user: refreshData.id_user,
            email: refreshData.email,
            role: refreshData.role || 'user'
        });
        
        // Actualizar request con nuevo token y datos de usuario
        req.token = newAccessToken;
        req.user = {
            id_user: refreshData.id_user,
            email: refreshData.email,
            role: refreshData.role || 'user'
        };
        req.tokenExpired = false;
        
        // Enviar nuevo token en header para cliente
        res.set('X-New-Access-Token', newAccessToken);
        
        // Continuar al siguiente middleware/controlador
        next();
        
    } catch (error) {
        // Si el refresh token es inválido, limpiar cookie y retornar error
        res.clearCookie('refresh_token');
        
        return res.status(401).json({ 
            success: false, 
            code: 'INVALID_SESSION',
            message: 'Sesión inválida. Por favor, inicia sesión nuevamente.' 
        });
    }
});

module.exports = checkRefreshCookie;