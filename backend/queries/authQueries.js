/**
 * Conjunto de consultas SQL para operaciones de autenticación
 * @module queries/authQueries
 * @description Consultas SQL específicas para login y verificación de usuarios.
 * Incluye queries parametrizadas para operaciones seguras de autenticación.
 */

/**
 * Objeto que contiene las queries SQL para el módulo de autenticación
 * @type {Object}
 * @property {string} login - Query para autenticar usuario por email
 * @property {string} getUserById - Query para obtener usuario por ID (sin password)
 */
const queries = {
  /**
   * Autenticar usuario por email (para operaciones de login)
   * @name login
   * @type {string}
   * @description Query parametrizada para buscar usuario por email.
   * Retorna todos los campos necesarios para validación de credenciales,
   * incluyendo el password hash para comparación con bcrypt.
   * 
   * Parámetros:
   * - $1: email (string) - Email del usuario a autenticar
   * 
   * Campos retornados:
   * - user_id (number) - Identificador único del usuario
   * - role (string) - Rol del usuario ('admin', 'hr', 'mkt', 'user')
   * - email (string) - Email del usuario
   * - password (string) - Password hash para comparación con bcrypt
   * 
   * @example
   * // Uso en authModel.login():
   * const result = await pool.query(queries.login, ['usuario@example.com']);
   * 
   * // Resultado posible:
   * // - Array con un objeto si el usuario existe
   * // - Array vacío [] si el usuario no existe
   * 
   * @important
   * Esta query debe usarse con bcrypt.compare() para verificar la contraseña.
   * Nunca se debe comparar passwords directamente en SQL.
   */
  login: `
  SELECT 
    user_id, 
    role, 
    email, 
    password
  FROM users
  WHERE email = $1
`,
  
  /**
   * Obtener información básica de usuario por ID
   * @name getUserById
   * @type {string}
   * @description Query parametrizada para obtener datos de usuario por ID.
   * NO incluye el campo password por seguridad. Usada para verificar
   * existencia de usuario durante refresh tokens o validaciones.
   * 
   * Parámetros:
   * - $1: user_id (number) - ID del usuario a buscar
   * 
   * Campos retornados:
   * - user_id (number) - Identificador único del usuario
   * - role (string) - Rol del usuario
   * - email (string) - Email del usuario
   * 
   * @example
   * // Uso en authModel o durante refresh token:
   * const result = await pool.query(queries.getUserById, [123]);
   * 
   * // Resultado:
   * // - Array con un objeto si el usuario existe
   * // - Array vacío [] si el usuario no existe
   * 
   * @note
   * Esta query es diferente de adminQueries.getUserById que SÍ incluye password.
   * Esta versión es para operaciones donde no se necesita validar password.
   */
  getUserById: `
  SELECT 
    user_id,
    role,
    email
  FROM users
  WHERE user_id = $1
`
};

module.exports = queries;