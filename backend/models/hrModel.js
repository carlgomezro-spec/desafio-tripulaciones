const pool = require('../config/db');
const queries = require('../queries/hrQueries');

/**
 * Modelo de datos para gestión de empleados (Recursos Humanos)
 * @module models/hrModel
 * @description Modelo que maneja todas las operaciones CRUD relacionadas con empleados.
 * Incluye búsqueda por ID, nombre, y operaciones completas de gestión de personal.
 * Normaliza datos (minúsculas) para consistencia en la base de datos.
 */

/**
 * Obtiene todos los empleados del sistema
 * @async
 * @function getAllEmployees
 * @memberof module:models/hrModel
 * @returns {Promise<Array<Object>>} Array de objetos con datos de todos los empleados
 * @throws {Error} Error al acceder a la base de datos
 * @example
 * // Uso:
 * const empleados = await getAllEmployees();
 * // Retorna: [
 * //   {employee_id: 1, first_name: 'juan', last_name: 'perez', ...},
 * //   {employee_id: 2, first_name: 'maria', last_name: 'garcia', ...}
 * // ]
 */
const getAllEmployees = async () => {
  try {
    const result = await pool.query(queries.getAllEmployees);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener empleados: ' + error.message);
  }
};

/**
 * Obtiene un empleado específico por su ID
 * @async
 * @function getEmployeeById
 * @memberof module:models/hrModel
 * @param {number} employee_id - ID numérico del empleado
 * @returns {Promise<Object>} Objeto con datos del empleado
 * @throws {Error} Empleado no encontrado o error de base de datos
 * @example
 * // Uso:
 * const empleado = await getEmployeeById(123);
 * // Retorna: {employee_id: 123, first_name: 'juan', last_name: 'perez', ...}
 * 
 * // Si no existe: throw new Error('Empleado con ID 123 no encontrado')
 */
const getEmployeeById = async (employee_id) => {  
  try {
    const result = await pool.query(queries.getEmployeeById, [employee_id]);
    if (result.rows.length === 0) {
      throw new Error(`Empleado con ID ${employee_id} no encontrado`);
    }
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener empleado por ID: ' + error.message);
  }
};

/**
 * Busca empleados por su nombre (coincidencia parcial, case-insensitive)
 * @async
 * @function getEmployeeByName
 * @memberof module:models/hrModel
 * @param {string} first_name - Nombre o parte del nombre a buscar
 * @returns {Promise<Array<Object>>} Array de objetos con empleados que coinciden
 * @throws {Error} No se encontraron empleados con ese nombre
 * @description 
 * Realiza búsqueda case-insensitive (convierte a minúsculas).
 * Puede retornar múltiples empleados si hay coincidencias parciales.
 * 
 * @example
 * // Uso:
 * const empleados = await getEmployeeByName('juan');
 * // Retorna: [
 * //   {employee_id: 1, first_name: 'juan', last_name: 'perez'},
 * //   {employee_id: 2, first_name: 'juan', last_name: 'garcia'}
 * // ]
 * 
 * @example
 * // Búsqueda parcial:
 * await getEmployeeByName('car'); // Encontraría 'carlos', 'carmen', etc.
 */
const getEmployeeByName = async (first_name) => {  
  try {
    const result = await pool.query(queries.getEmployeeByName, [first_name.toLowerCase()]);
    if (result.rows.length === 0) {
      throw new Error(`Empleado con nombre ${first_name} no encontrado`);
    }
    return result.rows;  
  } catch (error) {
    throw new Error('Error al obtener empleado por nombre: ' + error.message);
  }
};

/**
 * Crea un nuevo empleado en el sistema
 * @async
 * @function createEmployee
 * @memberof module:models/hrModel
 * @param {Object} employeeData - Datos del nuevo empleado
 * @param {number} employeeData.employee_id - ID único del empleado (requerido)
 * @param {string} employeeData.first_name - Nombre del empleado (requerido)
 * @param {string} employeeData.last_name - Apellido del empleado (requerido)
 * @param {string} employeeData.email - Email del empleado (requerido)
 * @param {string} employeeData.position - Cargo/Posición (requerido)
 * @param {string} employeeData.department - Departamento (requerido)
 * @param {number|string} employeeData.salary - Salario (requerido, se convierte a float)
 * @returns {Promise<Object>} Objeto con mensaje y datos del empleado creado
 * @throws {Error} Campos faltantes o error de base de datos
 * @description 
 * Todos los campos son obligatorios.
 * Convierte datos de texto a minúsculas para consistencia.
 * Convierte salary a número decimal.
 * 
 * @example
 * // Uso:
 * const resultado = await createEmployee({
 *   employee_id: 101,
 *   first_name: 'Carlos',
 *   last_name: 'Rodríguez',
 *   email: 'carlos@empresa.com',
 *   position: 'Desarrollador Senior',
 *   department: 'Tecnología',
 *   salary: 55000
 * });
 * // Retorna: {message: 'Empleado creado exitosamente', employee: {...}}
 */
const createEmployee = async (employeeData) => {
  const { first_name, last_name, email, position, department, salary } = employeeData;
  
  try {
    if (!first_name || !last_name || !email || !position || !department || !salary) {
      throw new Error('Todos los campos son requeridos (employee_id, first_name, last_name, email, position, department, salary)');
    }
    
    const result = await pool.query(queries.createEmployee, [
     
      first_name.toLowerCase(),
      last_name.toLowerCase(),
      email.toLowerCase(),  
      position.toLowerCase(),
      department.toLowerCase(),
      parseFloat(salary)
    ]);
    
    return {
      message: 'Empleado creado exitosamente',
      employee: result.rows[0]  
    };
  } catch (error) {
    throw new Error('Error al crear empleado: ' + error.message);
  }
};

/**
 * Actualiza un empleado existente por su ID
 * @async
 * @function updateEmployeeById
 * @memberof module:models/hrModel
 * @param {number} employee_id - ID del empleado a actualizar
 * @param {Object} employeeData - Campos a actualizar (todos opcionales)
 * @param {string} [employeeData.first_name] - Nuevo nombre
 * @param {string} [employeeData.last_name] - Nuevo apellido
 * @param {string} [employeeData.email] - Nuevo email
 * @param {string} [employeeData.position] - Nueva posición
 * @param {string} [employeeData.department] - Nuevo departamento
 * @param {number|string} [employeeData.salary] - Nuevo salario
 * @returns {Promise<Object>} Objeto con mensaje y datos del empleado actualizado
 * @throws {Error} Empleado no encontrado o error de base de datos
 * @description 
 * Actualización parcial: solo los campos proporcionados se actualizan.
 * Campos de texto se convierten a minúsculas.
 * Salary se convierte a float si se proporciona.
 * Mantiene valores actuales para campos no proporcionados.
 * 
 * @example
 * // Actualizar solo salario:
 * await updateEmployeeById(123, { salary: 60000 });
 * 
 * @example
 * // Actualizar múltiples campos:
 * await updateEmployeeById(123, { 
 *   position: 'Gerente de Proyecto',
 *   department: 'Innovación',
 *   salary: 65000
 * });
 */
const updateEmployeeById = async (employee_id, employeeData) => {  
  try {
    const existingEmployee = await pool.query(queries.getEmployeeById, [employee_id]);
    if (existingEmployee.rows.length === 0) {
      throw new Error(`Empleado con ID ${employee_id} no encontrado`);
    }
    
    const { first_name, last_name, email, position, department, salary } = employeeData;
    
    const updateData = {
      first_name: first_name ? first_name.toLowerCase() : existingEmployee.rows[0].first_name,
      last_name: last_name ? last_name.toLowerCase() : existingEmployee.rows[0].last_name,
      email: email ? email.toLowerCase() : existingEmployee.rows[0].email,  
      position: position ? position.toLowerCase() : existingEmployee.rows[0].position,
      department: department ? department.toLowerCase() : existingEmployee.rows[0].department,
      salary: salary ? parseFloat(salary) : existingEmployee.rows[0].salary
    };
    
    const result = await pool.query(queries.updateEmployeeById, [
      updateData.first_name,
      updateData.last_name,
      updateData.email,  
      updateData.position,
      updateData.department,
      updateData.salary,
      employee_id  
    ]);
    
    return {
      message: 'Empleado actualizado exitosamente',
      employee: result.rows[0]
    };
  } catch (error) {
    throw new Error('Error al actualizar empleado: ' + error.message);
  }
};

/**
 * Elimina un empleado del sistema por su ID
 * @async
 * @function deleteEmployeeById
 * @memberof module:models/hrModel
 * @param {number} employee_id - ID del empleado a eliminar
 * @returns {Promise<Object>} Objeto con mensaje y datos del empleado eliminado
 * @throws {Error} Empleado no encontrado o error de base de datos
 * @example
 * // Uso:
 * const resultado = await deleteEmployeeById(123);
 * // Retorna: {
 * //   message: 'Empleado con ID 123 eliminado exitosamente',
 * //   deletedEmployee: {employee_id: 123, first_name: 'juan', ...}
 * // }
 */
const deleteEmployeeById = async (employee_id) => {  
  try {
    const existingEmployee = await pool.query(queries.getEmployeeById, [employee_id]);
    if (existingEmployee.rows.length === 0) {
      throw new Error(`Empleado con ID ${employee_id} no encontrado`);
    }
    
    await pool.query(queries.deleteEmployeeById, [employee_id]);
    
    return {
      message: `Empleado con ID ${employee_id} eliminado exitosamente`,
      deletedEmployee: existingEmployee.rows[0]
    };
  } catch (error) {
    throw new Error('Error al eliminar empleado: ' + error.message);
  }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    getEmployeeByName,
    createEmployee,
    updateEmployeeById,
    deleteEmployeeById
};