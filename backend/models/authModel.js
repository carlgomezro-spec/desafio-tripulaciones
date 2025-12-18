const pool = require('../config/db');
const queries = require('../queries/authQueries');
const bcrypt = require('bcrypt'); 

/**
 * Modelo de datos para operaciones de autenticación
 * @module models/authModel
 * @description Modelo que maneja las operaciones de login y logout de usuarios.
 * Incluye verificación de credenciales con bcrypt y manejo seguro de contraseñas.
 */

/**
 * Autentica un usuario con email y contraseña
 * @async
 * @function login
 * @memberof module:models/authModel
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario (en texto plano)
 * @returns {Promise<Array<Object>>} Array con datos del usuario sin contraseña, o array vacío si falla
 * @throws {Error} Error de base de datos
 * @description 
 * Verifica las credenciales del usuario en este orden:
 * 1. Busca el usuario por email en la base de datos
 * 2. Si no existe, retorna array vacío `[]`
 * 3. Compara la contraseña proporcionada con el hash almacenado usando bcrypt
 * 4. Si las contraseñas no coinciden, retorna array vacío `[]`
 * 5. Si las credenciales son válidas, retorna array con un objeto del usuario SIN la contraseña
 * 
 * @example
 * // Uso con credenciales válidas:
 * const usuario = await login('admin@example.com', 'Password123');
 * // Retorna: [{user_id: 1, email: 'admin@example.com', role: 'admin', name: 'Juan', ...}]
 * 
 * @example
 * // Uso con credenciales inválidas:
 * const usuario = await login('noexiste@example.com', 'password');
 * // Retorna: [] (array vacío)
 * 
 * @example
 * // Uso típico en controller:
 * const userResult = await Auth.login(email, password);
 * if (userResult.length === 0) {
 *   // Credenciales inválidas
 *   return res.status(401).json({ message: 'Credenciales inválidas' });
 * }
 * const user = userResult[0]; // Usuario autenticado
 */
const login = async (email, password) => {
    try {
        const result = await pool.query(queries.login, [email]);
        
        if (result.rows.length === 0) {
            return [];
        }
        
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return [];
        }
        
        const { password: _, ...userWithoutPassword } = user;
        return [userWithoutPassword];
        
    } catch (error) {
        throw error;
    }
};

/**
 * Maneja el logout de un usuario (lógica en servidor)
 * @async
 * @function logout
 * @memberof module:models/authModel
 * @param {number} user_id - ID del usuario que cierra sesión
 * @returns {Promise<Object>} Objeto con confirmación del logout
 * @throws {Error} Si no se proporciona user_id
 * @description 
 * Esta función maneja la lógica del logout en el servidor:
 * - Valida que se proporcione un user_id
 * - Retorna un objeto de confirmación con timestamp
 * - En una implementación real, podría invalidar tokens, limpiar sesiones, etc.
 * 
 * Nota: El manejo real de logout (limpiar cookies/tokens) se hace en el controller.
 * Esta función es principalmente para consistencia en la arquitectura.
 * 
 * @example
 * // Uso:
 * const resultado = await logout(123);
 * // Retorna: {
 * //   success: true,
 * //   message: 'Sesión cerrada exitosamente',
 * //   user_id: 123,
 * //   logout_time: '2024-01-15T10:30:00.000Z'
 * // }
 * 
 * @example
 * // Error:
 * await logout(); // Sin user_id
 * // Throw: Error('user_id es requerido')
 */
const logout = async (user_id) => {
    try {

        if (!user_id) {
            throw new Error('user_id es requerido');
        }
        
        return {
            success: true,
            message: 'Sesión cerrada exitosamente',
            user_id: user_id,
            logout_time: new Date().toISOString()
        };
        
    } catch (error) {
        throw new Error('Error durante el logout: ' + error.message);
    }
};

module.exports = {
    login,
    logout
};