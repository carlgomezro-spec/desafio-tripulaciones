const { body } = require('express-validator');

/**
 * Validador para el endpoint de login
 * @module validators/authValidators
 * @description Define las reglas de validación para el inicio de sesión de usuarios.
 * Utiliza express-validator para validar email y contraseña.
 */
exports.loginValidator = [
  /**
   * Valida el campo email del formulario de login
   * @name validateEmail
   * @function
   * @memberof validators/authValidators
   * @returns {ValidationChain} Cadena de validación para express-validator
   * @example
   * // Uso en rutas:
   * router.post('/login', loginValidator, authController.login);
   * 
   * // Validaciones aplicadas:
   * // - Debe ser un email válido
   */
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  
  /**
   * Valida el campo password del formulario de login
   * @name validatePassword
   * @function
   * @memberof validators/authValidators
   * @returns {ValidationChain} Cadena de validación para express-validator
   * @description Valida que la contraseña cumpla con requisitos de seguridad:
   * - Longitud entre 8 y 16 caracteres
   * - Al menos una letra mayúscula
   * - Al menos una letra minúscula
   * - Al menos un número
   * 
   * @example
   * // Contraseñas válidas:
   * // - "Password123"
   * // - "AdminSecure456"
   * 
   * // Contraseñas inválidas:
   * // - "password" (sin mayúsculas ni números)
   * // - "PASSWORD123" (sin minúsculas)
   * // - "Pass1" (muy corta)
   * // - "PasswordVeryLong123456" (muy larga)
   * 
   * // Expresión regular:
   * /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,16}$/
   * 
   * // Explicación de la regex:
   * // ^            - Inicio de la cadena
   * // (?=.*[A-Z])  - Al menos una mayúscula
   * // (?=.*[a-z])  - Al menos una minúscula
   * // (?=.*\d)     - Al menos un dígito
   * // .{8,16}      - Longitud entre 8 y 16 caracteres
   * // $            - Fin de la cadena
   */
  body('password')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,16}$/)
    .withMessage('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número')
];