/**
 * Conjunto de consultas SQL para gestión de empleados (Recursos Humanos)
 * @module queries/hrQueries
 * @description Consultas SQL para operaciones CRUD completas de empleados.
 * Incluye búsqueda por ID, nombre, y operaciones con RETURNING clause para
 * confirmación de operaciones. Todas las queries están parametrizadas.
 */

/**
 * Objeto que contiene las queries SQL para el módulo de Recursos Humanos
 * @type {Object}
 * @property {string} getAllEmployees - Query para obtener todos los empleados
 * @property {string} getEmployeeById - Query para obtener empleado por ID
 * @property {string} getEmployeeByName - Query para buscar empleados por nombre
 * @property {string} createEmployee - Query para crear nuevo empleado
 * @property {string} updateEmployeeById - Query para actualizar empleado existente
 * @property {string} deleteEmployeeById - Query para eliminar empleado
 */
const queries = {
  /**
   * Obtener todos los empleados del sistema
   * @name getAllEmployees
   * @type {string}
   * @description Query completa para listar todos los empleados.
   * Ordena por departamento, luego apellido, luego nombre para agrupación lógica.
   * 
   * Campos retornados:
   * - employee_id (number) - Identificador único
   * - first_name (string) - Nombre
   * - last_name (string) - Apellido
   * - email (string) - Email corporativo
   * - position (string) - Cargo/posición
   * - department (string) - Departamento
   * - salary (number) - Salario
   * 
   * @example
   * // Uso en hrModel.getAllEmployees():
   * const result = await pool.query(queries.getAllEmployees);
   * // Retorna array con todos los empleados ordenados
   */
  getAllEmployees: `
    SELECT 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
    FROM employees
    ORDER BY department, last_name, first_name
  `,
  
  /**
   * Obtener un empleado específico por su ID
   * @name getEmployeeById
   * @type {string}
   * @description Query parametrizada para buscar empleado por ID.
   * Retorna todos los campos del empleado. Usada para verificación
   * de existencia y obtención de datos individuales.
   * 
   * Parámetros:
   * - $1: employee_id (number) - ID del empleado a buscar
   * 
   * Campos retornados: Mismos que getAllEmployees
   * 
   * @example
   * // Uso en hrModel.getEmployeeById():
   * const result = await pool.query(queries.getEmployeeById, [101]);
   * // Retorna array con el empleado 101 o array vacío si no existe
   */
  getEmployeeById: `
    SELECT 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
    FROM employees
    WHERE employee_id = $1
  `,
  
  /**
   * Buscar empleados por nombre o apellido (búsqueda parcial case-insensitive)
   * @name getEmployeeByName
   * @type {string}
   * @description Query para búsqueda flexible de empleados por nombre.
   * Usa LIKE con LOWER() para búsqueda case-insensitive y parcial.
   * Busca tanto en first_name como en last_name.
   * 
   * Parámetros:
   * - $1: searchTerm (string) - Término de búsqueda (ej: 'juan', 'car%')
   * 
   * Nota: El modelo convierte el término a minúsculas antes de pasarlo.
   * Para búsqueda parcial, agregar '%' al término (ej: 'car%' para 'carlos', 'carmen')
   * 
   * Campos retornados: Mismos que getAllEmployees
   * 
   * @example
   * // Búsqueda exacta (convertida a minúsculas en el modelo):
   * const result = await pool.query(queries.getEmployeeByName, ['juan']);
   * // Encuentra 'Juan', 'JUAN', 'juan', etc.
   * 
   * @example
   * // Búsqueda parcial:
   * const result = await pool.query(queries.getEmployeeByName, ['car%']);
   * // Encuentra 'Carlos', 'Carmen', 'Carolina', etc.
   */
  getEmployeeByName: `
    SELECT 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
    FROM employees
    WHERE LOWER(first_name) LIKE $1 
       OR LOWER(last_name) LIKE $1
    ORDER BY last_name, first_name
  `,
  
  /**
   * Crear un nuevo empleado en el sistema
   * @name createEmployee
   * @type {string}
   * @description Query de inserción con RETURNING clause.
   * Crea un nuevo registro de empleado con todos los campos requeridos.
   * Retorna los datos del empleado creado para confirmación.
   * 
   * Parámetros:
   * - $1: employee_id (number) - ID único del empleado
   * - $2: first_name (string) - Nombre (convertido a minúsculas en modelo)
   * - $3: last_name (string) - Apellido (convertido a minúsculas en modelo)
   * - $4: email (string) - Email (convertido a minúsculas en modelo)
   * - $5: position (string) - Cargo (convertido a minúsculas en modelo)
   * - $6: department (string) - Departamento (convertido a minúsculas en modelo)
   * - $7: salary (number) - Salario (convertido a float en modelo)
   * 
   * Campos retornados: Mismos que getAllEmployees
   * 
   * @example
   * // Uso en hrModel.createEmployee():
   * const result = await pool.query(queries.createEmployee, [
   *   101, 'carlos', 'rodriguez', 'carlos@empresa.com',
   *   'desarrollador', 'tecnologia', 55000
   * ]);
   * // Retorna array con datos del empleado creado
   */
  createEmployee: `
    INSERT INTO employees (
      first_name, 
      last_name,
      email,
      position, 
      department, 
      salary
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
  `,
  
  /**
   * Actualizar un empleado existente por su ID
   * @name updateEmployeeById
   * @type {string}
   * @description Query de actualización completa con RETURNING clause.
   * Actualiza todos los campos del empleado. En el modelo se maneja
   * actualización parcial manteniendo valores actuales para campos no proporcionados.
   * 
   * Parámetros:
   * - $1: first_name (string) - Nuevo nombre
   * - $2: last_name (string) - Nuevo apellido
   * - $3: email (string) - Nuevo email
   * - $4: position (string) - Nueva posición
   * - $5: department (string) - Nuevo departamento
   * - $6: salary (number) - Nuevo salario
   * - $7: employee_id (number) - ID del empleado a actualizar
   * 
   * Campos retornados: Mismos que getAllEmployees
   * 
   * @example
   * // Uso en hrModel.updateEmployeeById():
   * const result = await pool.query(queries.updateEmployeeById, [
   *   'carlos', 'rodriguez', 'carlos.nuevo@empresa.com',
   *   'desarrollador senior', 'innovacion', 60000, 101
   * ]);
   * // Retorna array con datos actualizados del empleado 101
   */
  updateEmployeeById: `
    UPDATE employees 
    SET 
      first_name = $1,
      last_name = $2,
      email = $3,
      position = $4,
      department = $5,
      salary = $6
    WHERE employee_id = $7
    RETURNING 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
  `,
  
  /**
   * Eliminar un empleado del sistema por su ID
   * @name deleteEmployeeById
   * @type {string}
   * @description Query de eliminación con RETURNING clause.
   * Elimina el registro del empleado y retorna sus datos para
   * confirmación y posible registro/log.
   * 
   * Parámetros:
   * - $1: employee_id (number) - ID del empleado a eliminar
   * 
   * Campos retornados: Mismos que getAllEmployees
   * 
   * @example
   * // Uso en hrModel.deleteEmployeeById():
   * const result = await pool.query(queries.deleteEmployeeById, [101]);
   * // Elimina empleado 101 y retorna sus datos (para confirmación)
   */
  deleteEmployeeById: `
    DELETE FROM employees 
    WHERE employee_id = $1
    RETURNING 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
  `
};

module.exports = queries;