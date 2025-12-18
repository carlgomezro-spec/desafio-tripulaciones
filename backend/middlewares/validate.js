const { validationResult } = require('express-validator');

/**
 * Middleware para manejo de errores de validación de express-validator
 * @module middlewares/validationMiddleware
 * @description Middleware que procesa los resultados de validación de express-validator
 * y retorna errores 400 si hay fallos de validación. Debe usarse después de los validators
 * en las rutas que requieren validación de entrada.
 * 
 * @example
 * // Uso con validators en rutas:
 * const { createUserValidator } = require('../validators/userValidators');
 * const handleValidationErrors = require('./middlewares/validationMiddleware');
 * 
 * router.post('/users',
 *   createUserValidator,          // 1. Valida los campos
 *   handleValidationErrors,       // 2. Procesa errores de validación
 *   userController.createUser     // 3. Ejecuta si la validación pasa
 * );
 * 
 * @example
 * // Respuesta cuando hay errores de validación:
 * // HTTP Status: 400 Bad Request
 * // Content-Type: application/json
 * // Body:
 * {
 *   "errors": [
 *     {
 *       "type": "field",
 *       "value": "emailinvalido",
 *       "msg": "Email inválido",
 *       "path": "email",
 *       "location": "body"
 *     },
 *     {
 *       "type": "field",
 *       "value": "pass",
 *       "msg": "La contraseña debe tener 8-16 caracteres...",
 *       "path": "password",
 *       "location": "body"
 *     }
 *   ]
 * }
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = handleValidationErrors;