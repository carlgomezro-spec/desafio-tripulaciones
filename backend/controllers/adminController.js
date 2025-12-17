const Admin = require('../models/adminModel.js');

/**
 * Módulo de controladores para operaciones administrativas
 * @module controllers/adminController
 * @description Controlador que gestiona todas las operaciones CRUD y consultas administrativas
 */

module.exports = {

    /**
     * Obtiene todas las ventas del sistema
     * @async
     * @function getSales
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error del servidor (500) si falla la consulta
     * @example
     * // GET /admin/sales
     * // Respuesta exitosa:
     * {
     *   "success": true,
     *   "count": 5,
     *   "data": [...]
     * }
     */
    getSales: async (req, res) => {
        try {
            const sales = await Admin.getSales();  
            res.json({
                success: true,
                count: sales.length,
                data: sales
            });
        } catch (err) {
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Obtiene todos los clientes del sistema
     * @async
     * @function getCustomers
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error del servidor (500) si falla la consulta
     * @example
     * // GET /admin/customers
     * // Respuesta exitosa:
     * {
     *   "success": true,
     *   "count": 20,
     *   "data": [...]
     * }
     */
    getCustomers: async (req, res) => {
        try {
            const customers = await Admin.getCustomers();  
            res.json({
                success: true,
                count: customers.length,
                data: customers
            });
        } catch (err) {
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Obtiene todos los productos del sistema
     * @async
     * @function getProducts
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error del servidor (500) si falla la consulta
     * @example
     * // GET /admin/products
     * // Respuesta exitosa:
     * {
     *   "success": true,
     *   "count": 50,
     *   "data": [...]
     * }
     */
    getProducts: async (req, res) => {
        try {
            const products = await Admin.getProducts();  
            res.json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (err) {
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Obtiene todos los empleados de recursos humanos
     * @async
     * @function getHr
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error del servidor (500) si falla la consulta
     * @example
     * // GET /admin/hr
     * // Respuesta exitosa:
     * {
     *   "success": true,
     *   "count": 10,
     *   "data": [...]
     * }
     */
    getHr: async (req, res) => {
        try {
            const hrEmployees = await Admin.getHr();  
            res.json({
                success: true,
                count: hrEmployees.length,
                data: hrEmployees
            });
        } catch (err) {
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Obtiene todos los usuarios del sistema
     * @async
     * @function getAllUsers
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error del servidor (500) si falla la consulta
     * @example
     * // GET /admin/users
     * // Respuesta exitosa:
     * {
     *   "success": true,
     *   "count": 100,
     *   "data": [...]
     * }
     */
    getAllUsers: async (req, res) => {
        try {
            const users = await Admin.getAllUsers();  
            res.json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (err) {
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Obtiene un usuario específico por su ID
     * @async
     * @function getUserById
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de la URL
     * @param {string} req.params.user_id - ID del usuario a consultar
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error 404 si el usuario no existe
     * @example
     * // GET /admin/users/123
     * // Respuesta exitosa:
     * {
     *   "success": true,
     *   "data": {...}
     * }
     */
    getUserById: async (req, res) => {
        try {
            const { user_id } = req.params;
            const user = await Admin.getUserById(user_id); 
            res.json({
                success: true,
                data: user
            });
        } catch (err) {
            res.status(404).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Crea un nuevo usuario en el sistema
     * @async
     * @function createUser
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.body - Datos del nuevo usuario
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error 400 si los datos son inválidos
     * @example
     * // POST /admin/users
     * // Body:
     * {
     *   "name": "Juan Pérez",
     *   "email": "juan@example.com",
     *   "role": "user"
     * }
     * // Respuesta exitosa (201):
     * {
     *   "success": true,
     *   "id": 123,
     *   "message": "Usuario creado exitosamente"
     * }
     */
    createUser: async (req, res) => {
        console.log('CreateUser body:', req.body);
        try {
            const result = await Admin.createUser(req.body); 
            res.status(201).json(result);
        } catch (err) {
            res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Actualiza un usuario existente por su ID
     * @async
     * @function updateUserById
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de la URL
     * @param {string} req.params.user_id - ID del usuario a actualizar
     * @param {Object} req.body - Datos actualizados del usuario
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error 400 si los datos son inválidos
     * @example
     * // PUT /admin/users/123
     * // Body:
     * {
     *   "name": "Juan Pérez Actualizado",
     *   "email": "juan.nuevo@example.com"
     * }
     * // Respuesta exitosa:
     * {
     *   "success": true,
     *   "message": "Usuario actualizado exitosamente"
     * }
     */
    updateUserById: async (req, res) => {
        try {
            const { user_id } = req.params;
            const result = await Admin.updateUserById(user_id, req.body);  
            res.json(result);
        } catch (err) {
            res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Elimina un usuario por su ID
     * @async
     * @function deleteUserById
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de la URL
     * @param {string} req.params.user_id - ID del usuario a eliminar
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<void>} Promesa que resuelve con la respuesta JSON
     * @throws {Error} Error 400 si no se puede eliminar el usuario
     * @example
     * // DELETE /admin/users/123
     * // Respuesta exitosa:
     * {
     *   "success": true,
     *   "message": "Usuario eliminado exitosamente"
     * }
     */
    deleteUserById: async (req, res) => {
        try {
            const { user_id } = req.params;
            const result = await Admin.deleteUserById(user_id);  
            res.json(result);
        } catch (err) {
            res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
    }
};