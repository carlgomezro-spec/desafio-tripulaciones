const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginValidator } = require('../validators/authValidator.js');
const handleValidationErrors = require('../middlewares/validate.js');

// Ciberseguridad (Rate limit)
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de login, intenta más tarde.'
});

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para gestión de autenticación y sesiones
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     description: |
 *       Autentica a un usuario con email y contraseña.
 *       
 *       **Características de seguridad:**
 *       - Rate limiting: Máximo 5 intentos en 5 minutos
 *       - Validación de contraseña: 8-16 caracteres, mayúscula, minúscula y número
 *       - Tokens JWT: Access token en respuesta, Refresh token en cookie HttpOnly
 *       - Protección contra fuerza bruta
 *       
 *       **Flujo:**
 *       1. Valida formato de email y contraseña
 *       2. Verifica credenciales en base de datos
 *       3. Genera access token (15 min) y refresh token (7 días)
 *       4. Establece refresh token como cookie segura
 *       5. Retorna access token y datos del usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@empresa.com
 *                 description: Email corporativo del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *                 description: |
 *                   Contraseña con los siguientes requisitos:
 *                   - 8-16 caracteres
 *                   - Al menos una mayúscula
 *                   - Al menos una minúscula
 *                   - Al menos un número
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   description: JWT Access token válido por 15 minutos
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: number
 *                   description: Tiempo de expiración en segundos (900 = 15 min)
 *                   example: 900
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: usuario@empresa.com
 *                     role:
 *                       type: string
 *                       enum: [admin, hr, mkt]
 *                       example: admin
 *                     name:
 *                       type: string
 *                       example: Juan
 *                     surname:
 *                       type: string
 *                       example: Pérez
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: |
 *               Refresh token establecido como cookie HttpOnly.
 *               Características:
 *               - HttpOnly (inaccesible desde JavaScript)
 *               - Secure (solo HTTPS en producción)
 *               - SameSite=Strict
 *               - Max-Age=7 días
 *               - Path=/api
 *       400:
 *         description: Error de validación en los datos de entrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: field
 *                       value:
 *                         type: string
 *                         example: pass
 *                       msg:
 *                         type: string
 *                         example: La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número
 *                       path:
 *                         type: string
 *                         example: password
 *                       location:
 *                         type: string
 *                         example: body
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Credenciales inválidas
 *       429:
 *         description: Demasiados intentos de login
 *         headers:
 *           Retry-After:
 *             description: Tiempo en segundos para reintentar
 *             schema:
 *               type: integer
 *               example: 300
 *           X-RateLimit-Limit:
 *             description: Límite máximo de intentos
 *             schema:
 *               type: integer
 *               example: 5
 *           X-RateLimit-Remaining:
 *             description: Intentos restantes
 *             schema:
 *               type: integer
 *               example: 0
 *           X-RateLimit-Reset:
 *             description: Timestamp de reset
 *             schema:
 *               type: integer
 *               example: 1678901234
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: TOO_MANY_ATTEMPTS
 *                 message:
 *                   type: string
 *                   example: Demasiados intentos de login. Intente nuevamente en 5 minutos.
 *                 retryAfter:
 *                   type: integer
 *                   description: Segundos hasta poder reintentar
 *                   example: 300
 *                 attemptsRemaining:
 *                   type: integer
 *                   example: 0
 *                 resetAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-03-15T10:30:00.000Z
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor
 *                 error:
 *                   type: string
 *                   description: Solo en desarrollo
 *                   example: Database connection failed
 *     security:
 *       - rateLimit: []
 *     x-codeSamples:
 *       - lang: curl
 *         label: cURL
 *         source: |
 *           curl -X POST http://localhost:3000/api/auth/login \
 *             -H "Content-Type: application/json" \
 *             -d '{"email":"usuario@empresa.com","password":"Password123"}'
 *       - lang: javascript
 *         label: JavaScript (fetch)
 *         source: |
 *           fetch('http://localhost:3000/api/auth/login', {
 *             method: 'POST',
 *             headers: { 'Content-Type': 'application/json' },
 *             credentials: 'include', // Importante para recibir cookies
 *             body: JSON.stringify({
 *               email: 'usuario@empresa.com',
 *               password: 'Password123'
 *             })
 *           })
 *           .then(response => response.json())
 *           .then(data => console.log(data));
 *     x-rate-limit:
 *       windowMs: 300000
 *       max: 5
 *       message: "Demasiados intentos de login"
 *       skipFailedRequests: false
 *     x-validator-rules:
 *       email:
 *         - isEmail: "Email inválido"
 *       password:
 *         - matches: "/^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,16}$/"
 *           message: "La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número"
 */

// POST http://localhost:3000/api/auth/login
router.post('/login', loginLimiter, loginValidator, handleValidationErrors, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Nuevo token generado exitosamente
 *         headers:
 *           X-New-Access-Token:
 *             schema:
 *               type: string
 *             description: Nuevo token de acceso en la cabecera
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Cookie de refresh token eliminada
 *       401:
 *         description: No autorizado
 */
router.post('/logout', authMiddleware.authenticate, authController.logout);

module.exports = router;