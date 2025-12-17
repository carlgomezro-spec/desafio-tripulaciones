const pool = require('../config/db');
const queries = require('../queries/adminQueries');
const bcrypt = require('bcrypt');

/**
 * Modelo de datos para operaciones administrativas
 * @module models/adminModel
 * @description Modelo que maneja todas las operaciones CRUD y consultas
 * administrativas relacionadas con ventas, clientes, productos, RRHH y usuarios.
 * Incluye validaciones de datos y manejo de contraseñas con bcrypt.
 */

/**
 * Obtiene todas las ventas del sistema
 * @async
 * @function getSales
 * @memberof module:models/adminModel
 * @returns {Promise<Array<Object>>} Array de objetos con datos de ventas
 * @throws {Error} Error al acceder a la base de datos
 * @example
 * // Uso:
 * const ventas = await getSales();
 * // Retorna: [{sale_id: 1, total: 100.50, ...}, ...]
 */
const getSales = async () => {
  try {
    const result = await pool.query(queries.getSales);
    return result.rows;
  } catch (error) {
    throw new Error('Error al mostrar las ventas: ' + error.message);
  }
};

/**
 * Obtiene todos los clientes del sistema
 * @async
 * @function getCustomers
 * @memberof module:models/adminModel
 * @returns {Promise<Array<Object>>} Array de objetos con datos de clientes
 * @throws {Error} Error al acceder a la base de datos
 * @example
 * // Uso:
 * const clientes = await getCustomers();
 * // Retorna: [{customer_id: 1, name: 'Cliente A', ...}, ...]
 */
const getCustomers = async () => {
  try {
    const result = await pool.query(queries.getCustomers);
    return result.rows;
  } catch (error) {
    throw new Error('Error al mostrar los clientes: ' + error.message);
  }
};

/**
 * Obtiene todos los productos del sistema
 * @async
 * @function getProducts
 * @memberof module:models/adminModel
 * @returns {Promise<Array<Object>>} Array de objetos con datos de productos
 * @throws {Error} Error al acceder a la base de datos
 * @example
 * // Uso:
 * const productos = await getProducts();
 * // Retorna: [{product_id: 1, name: 'Producto A', price: 50, ...}, ...]
 */
const getProducts = async () => {
  try {
    const result = await pool.query(queries.getProducts);
    return result.rows;
  } catch (error) {
    throw new Error('Error al mostrar los productos: ' + error.message);
  }
};

/**
 * Obtiene todos los empleados de recursos humanos
 * @async
 * @function getHr
 * @memberof module:models/adminModel
 * @returns {Promise<Array<Object>>} Array de objetos con datos de empleados de RRHH
 * @throws {Error} Error al acceder a la base de datos
 * @example
 * // Uso:
 * const empleados = await getHr();
 * // Retorna: [{employee_id: 1, name: 'Empleado A', department: 'RRHH', ...}, ...]
 */
const getHr = async () => {
  try {
    const result = await pool.query(queries.getHr);
    return result.rows;
  } catch (error) {
    throw new Error('Error al mostrar Dpto. RRHH: ' + error.message);
  }
};

/**
 * Obtiene todos los usuarios del sistema
 * @async
 * @function getAllUsers
 * @memberof module:models/adminModel
 * @returns {Promise<Array<Object>>} Array de objetos con datos de usuarios
 * @throws {Error} Error al acceder a la base de datos
 * @example
 * // Uso:
 * const usuarios = await getAllUsers();
 * // Retorna: [{user_id: 1, email: 'user@example.com', role: 'admin', ...}, ...]
 */
const getAllUsers = async () => {
  try {
    const result = await pool.query(queries.getAllUsers);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener usuarios: ' + error.message);
  }
};

/**
 * Obtiene un usuario específico por su ID
 * @async
 * @function getUserById
 * @memberof module:models/adminModel
 * @param {number} user_id - ID del usuario a buscar
 * @returns {Promise<Object>} Objeto con datos del usuario
 * @throws {Error} Usuario no encontrado o error de base de datos
 * @example
 * // Uso:
 * const usuario = await getUserById(123);
 * // Retorna: {user_id: 123, email: 'user@example.com', role: 'admin', ...}
 * 
 * // Si no existe: throw new Error('Usuario con ID 123 no encontrado')
 */
const getUserById = async (user_id) => {  
  try {
    const result = await pool.query(queries.getUserById, [user_id]);
    if (result.rows.length === 0) {
      throw new Error(`Usuario con ID ${user_id} no encontrado`);
    }
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener usuario por ID: ' + error.message);
  }
};

/**
 * Crea un nuevo usuario en el sistema
 * @async
 * @function createUser
 * @memberof module:models/adminModel
 * @param {Object} userData - Datos del nuevo usuario
 * @param {string} userData.role - Rol del usuario ('admin', 'hr', 'mkt')
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario (se hashea automáticamente)
 * @returns {Promise<Object>} Objeto con mensaje y datos del usuario creado
 * @throws {Error} Campos faltantes, rol inválido o error de base de datos
 * @example
 * // Uso:
 * const resultado = await createUser({
 *   role: 'admin',
 *   email: 'nuevo@example.com',
 *   password: 'Password123'
 * });
 * // Retorna: {message: 'Usuario creado exitosamente', user: {...}}
 */
const createUser = async (userData) => {
  const {role, email, password } = userData;
  
  try {

    if ( !role || !email || !password) {
      throw new Error('Todos los campos son requeridos');
    }
    
    const validRoles = ['admin', 'hr', 'mkt'];
    if (!validRoles.includes(role.toLowerCase())) {
      throw new Error('Rol inválido. Los roles permitidos son: admin, hr, mkt');
    }
    
    //Hashear contraseñas
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(queries.createUser, [
      role.toLowerCase(),
      email,
      hashedPassword
    ]);
    
    return {
      message: 'Usuario creado exitosamente',
      user: result.rows[0]
    };
  } catch (error) {
    console.error('Error creando usuario en DB:', error);
    throw new Error('Error al crear usuario: ' + error.message);
  }
};

/**
 * Actualiza un usuario existente por su ID
 * @async
 * @function updateUserById
 * @memberof module:models/adminModel
 * @param {number} user_id - ID del usuario a actualizar
 * @param {Object} userData - Campos a actualizar (todos opcionales)
 * @param {string} [userData.role] - Nuevo rol del usuario
 * @param {string} [userData.email] - Nuevo email del usuario
 * @param {string} [userData.password] - Nueva contraseña (cadena vacía mantiene la actual)
 * @returns {Promise<Object>} Objeto con mensaje y datos del usuario actualizado
 * @throws {Error} Usuario no encontrado, rol inválido o error de base de datos
 * @description 
 * Actualización parcial: solo los campos proporcionados se actualizan.
 * Contraseña: si se proporciona string vacío (""), se mantiene la contraseña actual.
 * Si se proporciona nueva contraseña, se hashea automáticamente.
 * 
 * @example
 * // Actualizar solo el rol:
 * await updateUserById(123, { role: 'hr' });
 * 
 * @example
 * // Actualizar email y contraseña:
 * await updateUserById(123, { 
 *   email: 'nuevo@email.com',
 *   password: 'NuevaPass123' 
 * });
 * 
 * @example
 * // Mantener contraseña actual:
 * await updateUserById(123, { 
 *   email: 'nuevo@email.com',
 *   password: ""  // ← cadena vacía = mantener contraseña
 * });
 */
const updateUserById = async (user_id, userData) => {  
  try {

    const existingUser = await pool.query(queries.getUserById, [user_id]);
    if (existingUser.rows.length === 0) {
      throw new Error(`Usuario con ID ${user_id} no encontrado`);
    }
    
    const {role, email, password } = userData;

    let newPassword;
    if (password !== undefined && password !== "") {
      const saltRounds = 10;
      newPassword = await bcrypt.hash(password, saltRounds);
    } else {
      newPassword = existingUser.rows[0].password; // mantener la contraseña actual
    }

    const updateData = {
      role: role ? role.toLowerCase() : existingUser.rows[0].role,
      email: email || existingUser.rows[0].email,
      password: newPassword || existingUser.rows[0].password
    };
    
    if (role) {
      const validRoles = ['admin', 'hr', 'mkt'];
      if (!validRoles.includes(updateData.role)) {
        throw new Error('Rol inválido. Los roles permitidos son: admin, hr, mkt');
      }
    }
    
    const result = await pool.query(queries.updateUserById, [
      updateData.role,
      updateData.email,
      updateData.password,
      user_id  
    ]);
    
    return {
      message: 'Usuario actualizado exitosamente',
      user: result.rows[0]
    };
  } catch (error) {
    console.error('Error editando usuario en DB:', error);
    throw new Error('Error al actualizar usuario: ' + error.message);
  }
};

/**
 * Elimina un usuario del sistema por su ID
 * @async
 * @function deleteUserById
 * @memberof module:models/adminModel
 * @param {number} user_id - ID del usuario a eliminar
 * @returns {Promise<Object>} Objeto con mensaje y datos del usuario eliminado
 * @throws {Error} Usuario no encontrado o error de base de datos
 * @example
 * // Uso:
 * const resultado = await deleteUserById(123);
 * // Retorna: {message: 'Usuario con ID 123 eliminado exitosamente', deletedUser: {...}}
 */
const deleteUserById = async (user_id) => {  
  try {

    const existingUser = await pool.query(queries.getUserById, [user_id]);
    if (existingUser.rows.length === 0) {
      throw new Error(`Usuario con ID ${user_id} no encontrado`);
    }
    
    await pool.query(queries.deleteUserById, [user_id]);  
    
    return {
      message: `Usuario con ID ${user_id} eliminado exitosamente`,
      deletedUser: existingUser.rows[0]
    };
  } catch (error) {
    throw new Error('Error al eliminar usuario: ' + error.message);
  }
};

module.exports = {
    getSales,
    getCustomers,
    getProducts,
    getHr,
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    deleteUserById
};