const { body, param } = require('express-validator');

/**
 * Roles de usuario válidos en el sistema
 * @type {Array<string>}
 * @constant
 * @private
 */
const validRoles = ['admin', 'hr', 'mkt'];

/**
 * Expresión regular para validar formato de email
 * @type {RegExp}
 * @constant
 * @private
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Expresión regular para validar fortaleza de contraseña
 * @type {RegExp}
 * @constant
 * @private
 * @description Valida que la contraseña tenga:
 * - 8-16 caracteres de longitud
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 */
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,16}$/;

/**
 * Validador para la creación de nuevos usuarios
 * @module validators/userValidators
 * @description Define las reglas de validación para crear un nuevo usuario en el sistema.
 * Valida rol, email y contraseña con requisitos específicos.
 * 
 * @type {Array}
 * 
 * @example
 * // Uso en rutas:
 * router.post('/users', createUserValidator, adminController.createUser);
 * 
 * // Body requerido:
 * {
 *   "role": "admin",
 *   "email": "usuario@example.com",
 *   "password": "Password123"
 * }
 */
exports.createUserValidator = [
  /**
   * Valida el campo 'role' durante la creación de usuario
   * @name validateRoleCreate
   * @function
   * @memberof validators/userValidators
   * @returns {Object} Cadena de validación
   * @description 
   * - Campo obligatorio
   * - Debe ser uno de: 'admin', 'hr', 'mkt' (case insensitive)
   */
  body('role')
    .notEmpty().withMessage('El rol es obligatorio')
    .custom(role => validRoles.includes(role.toLowerCase()))
    .withMessage(`Rol inválido. Los permitidos son: ${validRoles.join(', ')}`),
  
  /**
   * Valida el campo 'email' durante la creación de usuario
   * @name validateEmailCreate
   * @function
   * @memberof validators/userValidators
   * @returns {Object} Cadena de validación
   * @description 
   * - Campo obligatorio
   * - Debe tener formato de email válido
   * - Usa regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   */
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .matches(emailRegex).withMessage('Email inválido'),
  
  /**
   * Valida el campo 'password' durante la creación de usuario
   * @name validatePasswordCreate
   * @function
   * @memberof validators/userValidators
   * @returns {Object} Cadena de validación
   * @description 
   * - Campo obligatorio
   * - Debe cumplir con los requisitos de seguridad:
   *   - 8-16 caracteres
   *   - Al menos una mayúscula
   *   - Al menos una minúscula
   *   - Al menos un número
   */
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .matches(passwordRegex)
    .withMessage('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número')
];

/**
 * Validador para la actualización de usuarios existentes
 * @module validators/userValidators
 * @description Define las reglas de validación para actualizar un usuario existente.
 * Todos los campos son opcionales, pero si se proporcionan deben cumplir las reglas.
 * Permite cadena vacía en password para mantener la contraseña actual.
 * 
 * @type {Array}
 * 
 * @example
 * // Uso en rutas:
 * router.put('/users/:user_id', updateUserValidator, adminController.updateUserById);
 * 
 * // Body opcional (parcial update):
 * {
 *   "role": "hr",
 *   "email": "nuevo@example.com",
 *   "password": ""  // Cadena vacía = mantener contraseña actual
 * }
 */
exports.updateUserValidator = [
  /**
   * Valida el parámetro 'user_id' en la URL
   * @name validateUserIdParam
   * @function
   * @memberof validators/userValidators
   * @returns {Object} Cadena de validación
   * @description 
   * - Debe ser un número entero válido
   * - Parámetro obligatorio en la ruta
   */
  param('user_id')
    .isInt().withMessage('ID de usuario inválido'),
  
  /**
   * Valida el campo 'role' durante la actualización
   * @name validateRoleUpdate
   * @function
   * @memberof validators/userValidators
   * @returns {Object} Cadena de validación
   * @description 
   * - Campo opcional
   * - Si se proporciona, debe ser uno de: 'admin', 'hr', 'mkt'
   */
  body('role')
    .optional()
    .custom(role => validRoles.includes(role.toLowerCase()))
    .withMessage(`Rol inválido. Los permitidos son: ${validRoles.join(', ')}`),
  
  /**
   * Valida el campo 'email' durante la actualización
   * @name validateEmailUpdate
   * @function
   * @memberof validators/userValidators
   * @returns {Object} Cadena de validación
   * @description 
   * - Campo opcional
   * - Si se proporciona, debe tener formato de email válido
   */
  body('email')
    .optional()
    .matches(emailRegex).withMessage('Email inválido'),
  
  /**
   * Valida el campo 'password' durante la actualización
   * @name validatePasswordUpdate
   * @function
   * @memberof validators/userValidators
   * @returns {Object} Cadena de validación
   * @description 
   * - Campo opcional
   * - Permite cadena vacía para mantener contraseña actual
   * - Si se proporciona un valor no vacío, debe cumplir requisitos de seguridad
   * - Validación personalizada para manejar caso especial de cadena vacía
   */
  body('password')
    .optional()
    .custom((value) => {
      if (value === "") return true; // permite string vacío
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,16}$/;
      if (!passwordRegex.test(value)) {
        throw new Error('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
      }
      return true;
    })
];