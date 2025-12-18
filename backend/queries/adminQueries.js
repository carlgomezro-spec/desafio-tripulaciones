/**
 * Conjunto de consultas SQL para operaciones administrativas
 * @module queries/adminQueries
 * @description Colección de consultas SQL utilizadas por el modelo adminModel.
 * Incluye queries para ventas, clientes, productos, RRHH y gestión de usuarios.
 * Las queries usan LEFT JOINs para relaciones y ordenamientos lógicos.
 */

/**
 * Objeto que contiene todas las queries SQL para el módulo administrativo
 * @type {Object}
 * @property {string} getSales - Query para obtener todas las ventas con joins
 * @property {string} getCustomers - Query para obtener todos los clientes
 * @property {string} getProducts - Query para obtener todos los productos
 * @property {string} getHr - Query para obtener empleados del departamento HR/RRHH
 * @property {string} getAllUsers - Query para obtener todos los usuarios
 * @property {string} getUserById - Query para obtener un usuario específico por ID
 * @property {string} createUser - Query para crear un nuevo usuario
 * @property {string} updateUserById - Query para actualizar un usuario existente
 * @property {string} deleteUserById - Query para eliminar un usuario
 */
const queries = {
  /**
   * Obtener todas las ventas del sistema con información relacionada
   * @name getSales
   * @type {string}
   * @description Query que obtiene ventas con joins a empleados, clientes y productos.
   * Incluye cálculos de subtotal, descuento y total. Ordena por fecha descendente.
   * 
   * Campos retornados:
   * - sale_id, employee_id, employee_name, customer_id, customer_name
   * - product_id, product_name, sales_channel, quantity, discount_percentage
   * - payment_method, subtotal, discount_amount, total, hour, day, month, year
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.getSales);
   * // Retorna array de ventas con toda la información relacionada
   */
  getSales: `
    SELECT 
      s.sale_id,
      s.employee_id,
      CONCAT(e.first_name, ' ', e.last_name) as employee_name,
      s.customer_id,
      CONCAT(c.first_name, ' ', c.last_name) as customer_name,
      s.product_id,
      p.product_name,
      s.sales_channel,
      s.quantity,
      s.discount_percentage,
      s.payment_method,
      s.subtotal,
      s.discount_amount,
      s.total,
      s.hour,
      s.day,
      s.month,
      s.year
    FROM sales s
    LEFT JOIN employees e ON s.employee_id = e.employee_id
    LEFT JOIN customers c ON s.customer_id = c.customer_id
    LEFT JOIN products p ON s.product_id = p.product_id
    ORDER BY s.year DESC, s.month DESC, s.day DESC, s.hour DESC
  `,
  
  /**
   * Obtener todos los clientes del sistema
   * @name getCustomers
   * @type {string}
   * @description Query simple para obtener información básica de clientes.
   * Ordena alfabéticamente por apellido y nombre.
   * 
   * Campos retornados:
   * - customer_id, first_name, last_name, email, region
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.getCustomers);
   * // Retorna array con todos los clientes ordenados
   */
  getCustomers: `
    SELECT 
      customer_id,
      first_name_customer as first_name,
      last_name_customer as last_name,
      email_customer as email,
      region
    FROM customers
    ORDER BY last_name_customer, first_name_customer
  `,
  
  /**
   * Obtener todos los productos del catálogo
   * @name getProducts
   * @type {string}
   * @description Query para obtener información básica de productos.
   * Ordena alfabéticamente por nombre de producto.
   * 
   * Campos retornados:
   * - product_id, product_name, category, unit_price
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.getProducts);
   * // Retorna array con todos los productos ordenados
   */
  getProducts: `
    SELECT 
      product_id,
      product_name,
      category,
      unit_price
    FROM products
    ORDER BY product_name
  `,
  
  /**
   * Obtener empleados del departamento de Recursos Humanos
   * @name getHr
   * @type {string}
   * @description Query que filtra empleados por departamento HR/RRHH.
   * Útil para reportes específicos del departamento de recursos humanos.
   * 
   * Campos retornados:
   * - employee_id, first_name, last_name, position, department, salary
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.getHr);
   * // Retorna solo empleados de RRHH/HR ordenados por nombre
   */
  getHr: `
    SELECT 
      employee_id,
      first_name,
      last_name,
      position,
      department,
      salary
    FROM employees
    WHERE department = 'HR' OR department = 'RRHH'
    ORDER BY last_name, first_name
  `,
  
  /**
   * Obtener todos los usuarios del sistema
   * @name getAllUsers
   * @type {string}
   * @description Query para obtener información básica de usuarios.
   * No incluye contraseñas por seguridad. Ordena por rol y ID.
   * 
   * Campos retornados:
   * - user_id, role, email
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.getAllUsers);
   * // Retorna array con todos los usuarios (sin passwords)
   */
  getAllUsers: `
  SELECT 
    user_id,
    role,
    email
  FROM users
  ORDER BY role, user_id
`,
  
  /**
   * Obtener un usuario específico por su ID
   * @name getUserById
   * @type {string}
   * @description Query parametrizada para buscar usuario por ID.
   * Incluye password (hash) para validación en login.
   * Usa parámetro posicional $1 para el user_id.
   * 
   * Campos retornados:
   * - user_id, role, email, password
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.getUserById, [123]);
   * // Busca usuario con ID 123, retorna objeto o vacío
   */
  getUserById: `
  SELECT 
    user_id,
    role,
    email,
    password
  FROM users
  WHERE user_id = $1
`,
  
  /**
   * Crear un nuevo usuario en el sistema
   * @name createUser
   * @type {string}
   * @description Query de inserción con RETURNING para obtener datos creados.
   * Incluye parámetros para role, email y password (hash).
   * No retorna el password por seguridad.
   * 
   * Parámetros:
   * - $1: role (string)
   * - $2: email (string)
   * - $3: password (string - hash)
   * 
   * Campos retornados:
   * - user_id, role, email
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.createUser, ['admin', 'user@example.com', 'hash123']);
   * // Retorna objeto con datos del usuario creado (sin password)
   */
  createUser: `
    INSERT INTO users (role, email, password)
    VALUES ($1, $2, $3)
    RETURNING 
      user_id,
      role,
      email
  `,
  
  /**
   * Actualizar un usuario existente por ID
   * @name updateUserById
   * @type {string}
   * @description Query de actualización con RETURNING para obtener datos actualizados.
   * Actualiza role, email y/o password según parámetros proporcionados.
   * Usa cláusula WHERE con user_id.
   * 
   * Parámetros:
   * - $1: role (string)
   * - $2: email (string)
   * - $3: password (string - hash, opcional)
   * - $4: user_id (number)
   * 
   * Campos retornados:
   * - user_id, role, email
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.updateUserById, ['hr', 'nuevo@email.com', 'nuevoHash', 123]);
   * // Actualiza usuario 123 y retorna datos actualizados
   */
  updateUserById: `
    UPDATE users 
    SET 
      role = $1,
      email = $2,
      password = $3
    WHERE user_id = $4
    RETURNING 
      user_id,
      role,
      email
  `,
  
  /**
   * Eliminar un usuario del sistema por ID
   * @name deleteUserById
   * @type {string}
   * @description Query de eliminación con RETURNING para confirmar eliminación.
   * Retorna datos del usuario eliminado para registro/confirmación.
   * 
   * Parámetros:
   * - $1: user_id (number)
   * 
   * Campos retornados:
   * - user_id, role, email
   * 
   * @example
   * // Uso en el modelo:
   * const result = await pool.query(queries.deleteUserById, [123]);
   * // Elimina usuario 123 y retorna sus datos (confirmación)
   */
  deleteUserById: `
    DELETE FROM users 
    WHERE user_id = $1
    RETURNING 
      user_id,
      role,
      email
  `
};

module.exports = queries;